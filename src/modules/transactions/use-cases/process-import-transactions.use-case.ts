import { parse } from 'csv-parse';
import { folderPathSpreadsheet } from '../domain/constants/folder-spreadsheet-imported.js';
import { CurrencyAcceptedTransaction, TransactionEntity } from '../infrastructure/transction.entity.js';
import fs, { createReadStream } from 'fs';
import { HEADER_ACCEPTED } from '../domain/constants/headers-accepteds-on-file-import.constants.js';
import { validate } from 'class-validator';
import { TransactionDTO } from '../dto/transaction.dto.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionRepository } from '../interfaces/transaction-repository.js';
import { CheckMetrics } from '@/utils/check-metrics.js';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { tryCatch } from 'bullmq';



type TypeParameters = {
    bank: string;
    filename: string;
    importID: string;
}

@Injectable()
export class ProcessImportTransactionsUseCase {
    constructor(
        @Inject(TransactionRepository)
        private readonly transactionRepository: TransactionRepository,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: Logger
    ) { }

    async execute({ bank, filename, importID }: TypeParameters) {
        return new Promise((resolve, reject) => {

            const filePath = `${folderPathSpreadsheet}/${filename}`;
            const stream = createReadStream(filePath);

            const parser = parse({ delimiter: ',' });

            let records: Array<TransactionDTO> = [];
            const recordsNonStandart: Array<{ transaction: TransactionDTO, contentsError: string[] }> = [];

            let countRow = 0;
            let messageValidSpreadsheet: string | undefined;
            let headerIsValid = false;
            let headerOnSpreadsheet: Array<string> = [];
            let batchSize = 2000;

            stream.pipe(parser);

            // console.log('starting', filename, new Date().toISOString());

            parser.on('readable', async () => {
                let recordStrem = parser.read();
                try {
                    while (recordStrem !== null) {

                        if (countRow == 0 && !headerIsValid) {
                            parser.pause();

                            headerOnSpreadsheet = recordStrem;
                            const checkHeader = this.validHead(headerOnSpreadsheet);

                            headerIsValid = checkHeader.isValid;

                            if (!checkHeader.isValid) {
                                throw new Error(checkHeader.message);
                            } else
                                parser.resume();
                        } else {
                            const transactionPrepared = await this.convertArrayLineToTransactionEntity(recordStrem, bank, importID);
                            if (transactionPrepared.error) {
                                recordsNonStandart.push({ transaction: transactionPrepared.transaction, contentsError: transactionPrepared.contentsError });
                                if (!messageValidSpreadsheet)
                                    messageValidSpreadsheet = 'Existe linhas que não seguem o padrão esperado';

                            } else {
                                records.push(transactionPrepared.transaction as TransactionEntity);
                                countRow++;
                                if (countRow == batchSize) {
                                    parser.pause();

                                    if (Boolean(messageValidSpreadsheet))
                                        throw new Error(messageValidSpreadsheet)

                                    await this.transactionRepository.createMany(records);

                                    records = [];
                                    countRow = 0;
                                    parser.resume();
                                }
                            }
                        }

                        recordStrem = parser.read();
                    }
                } catch (error: unknown) {
                    parser.destroy(error as Error)
                }
            }).on('error', (err) => {
                reject(err);
            }).on('end', async () => {
                await this.transactionRepository.createMany(records);

                records = [];
                fs.unlinkSync(filePath);
            });
            // if (Boolean(messageValidSpreadsheet))
            //     throw new BadRequestException(messageValidSpreadsheet);
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

        const headIsValid = headSpreadsheet.map((value, indice) => {
            const check = value === headerAccepted[indice];
            if (!check)
                return nonStandartColumn.push(`${value} => ${headerAccepted[indice]}`)

            return null;
        }).filter(Boolean);

        if (headIsValid.length > 0) {
            isValid = false;
            message = `Algumas colunas do header estão com a descrição diferente do esperado. (${nonStandartColumn.join(' | ')})`
        }

        return { isValid, message }
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

}
