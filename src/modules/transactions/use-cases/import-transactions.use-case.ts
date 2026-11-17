import { parse } from 'csv-parse';
import { folderPathSpreadsheet } from '../domain/constants/folder-spreadsheet-imported.js';
import { CurrencyAcceptedTransaction, TransactionEntity } from '../infrastructure/transction.entity.js';
import fs, { createReadStream } from 'fs';
import { HEADER_ACCEPTED } from '../domain/constants/headers-accepteds-on-file-import.constants.js';
import { validate } from 'class-validator';
import { TransactionDTO } from '../dto/transaction.dto.js';
import { Inject, Injectable } from '@nestjs/common';
import { TransactionRepository } from '../interfaces/TransactionRepository.js';



type TypeParameters = {
    bank: string;
    filename: string
}

@Injectable()
export class ImportTransactionsUseCase {
    constructor(
        @Inject(TransactionRepository)
        private readonly transactionRepository: TransactionRepository
    ) { }

    async execute({ bank, filename }: TypeParameters) {
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

        stream.pipe(parser)
        console.log('starting', new Date().toISOString())
        parser.on('readable', async () => {
            let recordStrem = parser.read();
            while (recordStrem !== null) {

                if (countRow == 0 && !headerIsValid) {
                    parser.pause();

                    headerOnSpreadsheet = recordStrem;
                    const checkHeader = this.validHead(headerOnSpreadsheet);

                    headerIsValid = checkHeader.isValid;

                    if (!checkHeader.isValid) {
                        messageValidSpreadsheet = checkHeader.message;
                        parser.destroy();
                        break;
                    } else
                        parser.resume();
                } else {
                    const transactionPrepared = await this.convertArrayLineToTransactionEntity(recordStrem, bank);
                    if (transactionPrepared.error) {
                        recordsNonStandart.push({ transaction: transactionPrepared.transaction, contentsError: transactionPrepared.contentsError });
                        if (!messageValidSpreadsheet)
                            messageValidSpreadsheet = 'Existe linhas que não seguem o padrão esperado'

                    } else {
                        records.push(transactionPrepared.transaction as TransactionEntity);
                        countRow++;
                        if (countRow == batchSize) {
                            parser.pause();
                            await this.transactionRepository.createMany(records);
                            records = [];
                            countRow = 0;
                            parser.resume();
                        }
                    }
                }

                recordStrem = parser.read();
            }
        }).on('error', (err) => {
            console.error(err);
        }).on('end', async () => {
            await this.transactionRepository.createMany(records);
            records = [];
            fs.unlinkSync(filePath);
            console.log(`finish ${new Date().toISOString()}`)
        }).on('close', () => {
            console.log({ countRow, messageValidSpreadsheet })
        });
        // if (Boolean(messageValidSpreadsheet))
        //     throw new BadRequestException(messageValidSpreadsheet);
    }

    private validHead(headSpreadsheet: string[]) {
        const headerAccepted = Object.keys(HEADER_ACCEPTED);
        let isValid = true;
        let message;
        const nonStandartColumn: Array<string> = []

        if (headSpreadsheet.length != headerAccepted.length) {
            isValid = false;
            message = 'O csv está com o head fora do padrão esperado';
        }

        const headIsValid = headSpreadsheet.every((value, indice) => {
            const check = value === headerAccepted[indice];
            if (!check)
                nonStandartColumn.push(`${value} => ${headerAccepted[indice]}`)
            return check;
        });

        if (!headIsValid) {
            isValid = false;
            message = `Algumas colunas do header estão com a descrição diferente do esperado. (${nonStandartColumn.join(' | ')})`
        }

        return { isValid, message }
    }

    private async convertArrayLineToTransactionEntity(line: string[], bank: string) {
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

        const validation = await validate(transaction);
        const contentsError = validation.length > 0 ? validation.map(v => Object.keys(v.constraints!).map(key => v.constraints![key])[0]) : []

        return { error: validation.length > 0, transaction, contentsError }
    }

}
