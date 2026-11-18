import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, ParseFilePipe, Injectable, Inject, HttpCode } from '@nestjs/common';
import { AuthJWT } from '../auth/auth-jwt.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { optionsSaveFileTransactions, validatorFileTransactions } from '@/config/module-multer-file-spreadsheet.config.js';
import { ImportTransctionsDTO } from './dto/import-transctions.dto.js';
import { TransactionImportQueue } from './interfaces/transaction-import.queue.js';
import path from 'path';
import { CreateImportUseCase } from './use-cases/create-import.use-case.js';
// import { ImportTransactionsUseCase } from './use-cases/process-import-transactions.use-case.js';

@Controller('transactions')
export class TransactionsController {
    constructor(
        @Inject(CreateImportUseCase)
        private readonly createImportUseCase: CreateImportUseCase
    ) {

    }

    @Post('import')
    @HttpCode(202)
    @UseGuards(AuthJWT)
    @UseInterceptors(FileInterceptor('spreadsheet', optionsSaveFileTransactions))
    async import(@UploadedFile(validatorFileTransactions) file: Express.Multer.File, @Body() importDTO: ImportTransctionsDTO) {
        const [importID, extension] = file.filename.split('.');

        await this.createImportUseCase.execute({
            importID,
            bank: importDTO.bank,
            extension
        });

        return {
            importID,
            status: 'PENDING'
        }
    }
}
