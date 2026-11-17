import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, ParseFilePipe, Injectable } from '@nestjs/common';
import { AuthJWT } from '../auth/auth-jwt.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { optionsSaveFileTransactions, validatorFileTransactions } from '@/config/ConfigMulterFileSpreadsheet.js';
import { ImportTransctionsDTO } from './dto/import-transctions.dto.js';
import { ImportTransactionsUseCase } from './use-cases/import-transactions.use-case.js';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private readonly importTransactionUseCase: ImportTransactionsUseCase
    ) {

    }

    @Post('import')
    @UseGuards(AuthJWT)
    @UseInterceptors(FileInterceptor('spreadsheet', optionsSaveFileTransactions))
    async import(@UploadedFile(validatorFileTransactions) file: Express.Multer.File, @Body() importDTO: ImportTransctionsDTO) {
        return await this.importTransactionUseCase.execute({ bank: importDTO.bank, filename: file.filename });
    }
}
