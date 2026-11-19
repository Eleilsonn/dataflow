import { parse } from 'csv-parse';
import { folderPathSpreadsheet } from '../domain/constants/folder-spreadsheet-imported.js';
import { CurrencyAcceptedTransaction, TransactionEntity } from '../infrastructure/entities/transction.entity.js';
import fs, { createReadStream, statSync } from 'fs';
import { HEADER_ACCEPTED } from '../domain/constants/headers-accepteds-on-file-import.constants.js';
import { validate } from 'class-validator';
import { TransactionDTO } from '../dto/transaction.dto.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionRepository } from '../interfaces/transaction-repository.js';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ImportHistoryRepository, IUpdateImportHistory } from '../interfaces/import-history.repository.js';
import { StatusImport } from '../infrastructure/entities/files-imported.entity.js';
import { Job } from 'bullmq';



type TypeParameters = {
    bank: string;
    filename: string;
    importID: string;
    userID: string;
    job: Job
}

type TypeParamsPublisherProgress = {
    importID: string;
    countSaved: number;
    countDuplicate: number;
    bytesSizeFile: number;
    bytesRead: number;
    status: string;
    job: Job;
    userID: string;
    startAt?: Date;
    finishAt?: Date;
}

@Injectable()
export class ProcessImportTransactionsUseCase {
    constructor(
        @Inject(TransactionRepository)
        private readonly transactionRepository: TransactionRepository,
        @Inject(ImportHistoryRepository)
        private readonly importHistoryRepository: ImportHistoryRepository,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: Logger
    ) { }

    async execute({ bank, filename, importID, job, userID }: TypeParameters) {
        return new Promise(async (resolve, reject) => {

            const filePath = `${folderPathSpreadsheet}/${filename}`;
            const stream = createReadStream(filePath);

            const parser = parse({ delimiter: ',' });

            let records: Array<TransactionDTO> = [];
            const recordsNonStandart: Array<{ transaction: TransactionDTO, contentsError: string[], positionLine: number }> = [];
            let columnsNonStandart: string[] | undefined;


            let countRowByBatch = 0;
            let countRow = 0;
            // let countSaved = 0;
            // let countDuplicate = 0;
            // let bytesRead = 0;

            let messageErrorValidRow: string | undefined;
            let headerIsValid = false;
            let headerOnSpreadsheet: Array<string> = [];
            let batchSize = 2000;
            const fileSize = statSync(filePath).size;

            const optionsPublish: TypeParamsPublisherProgress = {
                importID,
                countSaved: 0,
                countDuplicate: 0,
                bytesSizeFile: fileSize,
                bytesRead: 0,
                status: 'PROCESSING',
                job,
                userID,
                startAt: new Date()
            }

            stream.pipe(parser);

            await this.alterImportHistory(importID, { status: StatusImport.PROCESSING, start: new Date() });
            this.publisherProgress(optionsPublish);

            parser.on('readable', async () => {
                let recordStrem = parser.read();
                try {
                    while (recordStrem !== null) {
                        optionsPublish.bytesRead = stream.bytesRead;

                        if (countRowByBatch == 0 && !headerIsValid) {
                            parser.pause();

                            headerOnSpreadsheet = recordStrem;

                            const checkHeader = this.validHead(headerOnSpreadsheet);

                            headerIsValid = checkHeader.isValid;

                            if (!checkHeader.isValid) {
                                columnsNonStandart = checkHeader.nonStandartColumn;
                                throw new Error(checkHeader.message);
                            } else
                                parser.resume();
                        } else {
                            const transactionPrepared = await this.convertArrayLineToTransactionEntity(recordStrem, bank, importID);
                            if (transactionPrepared.error) {
                                recordsNonStandart.push({
                                    transaction: transactionPrepared.transaction,
                                    contentsError: transactionPrepared.contentsError,
                                    positionLine: countRow
                                });

                                if (!messageErrorValidRow)
                                    messageErrorValidRow = 'Existem linhas que não seguem o padrão esperado';

                            } else {
                                records.push(transactionPrepared.transaction as TransactionEntity);
                                countRowByBatch++;
                                if (countRowByBatch == batchSize) {
                                    parser.pause();

                                    const { count_saved } = await this.persistData(records, messageErrorValidRow);
                                    optionsPublish.countSaved += count_saved;
                                    optionsPublish.countDuplicate += records.length - count_saved;

                                    this.publisherProgress(optionsPublish);

                                    records = [];
                                    countRowByBatch = 0;
                                    parser.resume();
                                }
                            }

                            countRow++;
                        }

                        recordStrem = parser.read();
                    }
                } catch (error: unknown) {
                    parser.destroy(error as Error)
                }
            }).on('error', async (err) => {
                await this.alterImportHistory(importID, {
                    status: StatusImport.ERROR,
                    reason_error: err.message,
                    divergent_columns: columnsNonStandart
                });

                await this.transactionRepository.deleteByImportID(importID);
                optionsPublish.status = 'ERROR';
                optionsPublish.finishAt = new Date();
                this.publisherProgress(optionsPublish);
                reject(err);
            }).on('end', async () => {
                try {
                    const { count_saved } = await this.persistData(records, messageErrorValidRow);
                    optionsPublish.countSaved += count_saved;
                    optionsPublish.countDuplicate += records.length - count_saved;

                    await this.alterImportHistory(importID, {
                        status: StatusImport.CONCLUDED,
                        finish: new Date(),
                        count_records: countRow
                    });
                    if (records.length > 0) {
                        optionsPublish.status = 'CONCLUDED';
                        optionsPublish.finishAt = new Date();

                        this.publisherProgress(optionsPublish);
                    }

                    records = [];
                    fs.unlinkSync(filePath);

                    resolve(true);
                } catch (error: unknown) {
                    const lines = recordsNonStandart.map(item => item.positionLine.toString())

                    await this.alterImportHistory(importID, {
                        status: StatusImport.ERROR,
                        reason_error: (error as Error).message,
                        divergent_columns: lines.length > 0 ? lines : undefined
                    });

                    await this.transactionRepository.deleteByImportID(importID);

                    optionsPublish.status = 'ERROR';
                    this.publisherProgress(optionsPublish);
                    reject(error)
                }
            })
        })
    }

    private validHead(headSpreadsheet: string[]) {
        const headerAccepted = Object.keys(HEADER_ACCEPTED);
        let isValid = true;
        let message;
        const nonStandartColumn: Array<string> = []

        if (headSpreadsheet.length != headerAccepted.length) {
            return {
                isValid: false,
                message: 'O csv está com o head fora do padrão esperado'
            };
        }

        headSpreadsheet.map((value, indice) => {
            const check = value === headerAccepted[indice];
            if (!check)
                nonStandartColumn.push(`${value} => ${headerAccepted[indice]}`)
        });

        if (nonStandartColumn.length > 0) {
            isValid = false;
            message = `Algumas colunas do header estão com a descrição diferente do esperado. (${nonStandartColumn.join(' | ')})`
        }

        return { isValid, message, nonStandartColumn }
    }

    private async convertArrayLineToTransactionEntity(line: string[], bank: string, importID: string) {
        const keyHeader = Object.keys(HEADER_ACCEPTED);
        const transaction = new TransactionDTO();

        transaction.bank = bank;
        transaction.transaction_id = line[keyHeader.indexOf('transaction_id')];
        transaction.account_id = line[keyHeader.indexOf('account_id')];
        transaction.amount = Number(line[keyHeader.indexOf('amount')]);
        transaction.currency = line[keyHeader.indexOf('currency')] as CurrencyAcceptedTransaction;
        transaction.transaction_type = line[keyHeader.indexOf('transaction_type')];
        transaction.status = line[keyHeader.indexOf('status')];
        transaction.created_at = new Date(line[keyHeader.indexOf('created_at')]);
        transaction.description = line[keyHeader.indexOf('description')];
        transaction.import_id = importID;

        const validation = await validate(transaction);
        const contentsError = validation.length > 0 ? validation.map(v => Object.keys(v.constraints!).map(key => v.constraints![key])[0]) : []

        return { error: validation.length > 0, transaction, contentsError }
    }

    private async persistData(records: Array<TransactionDTO>, messageErrorValidRow?: string) {
        if (Boolean(messageErrorValidRow))
            throw new Error(messageErrorValidRow)

        if (records.length > 0) {
            const { count_saved } = await this.transactionRepository.createMany(records);
            return { count_saved };
        }

        return { count_saved: 0 };
    }

    private async alterImportHistory(importID: string, data: IUpdateImportHistory) {
        await this.importHistoryRepository.updateByImportID(importID, data);
    }

    private async publisherProgress(options: TypeParamsPublisherProgress) {
        const progressPercent = Number(((options.bytesRead * 100) / options.bytesSizeFile).toFixed(2));
        options.job.updateProgress({
            importID: options.importID,
            status: options.status,
            progress_percent: progressPercent,
            countSaved: options.countSaved,
            countDuplicate: options.countDuplicate,
            userID: options.userID,
            startAt: options.startAt,
            finishAt: options.finishAt
        });
    }
}
