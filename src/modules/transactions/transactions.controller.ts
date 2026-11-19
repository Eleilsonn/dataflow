import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, Inject, HttpCode, Req, Sse, Param } from '@nestjs/common';
import { AuthJWT } from '../auth/auth-jwt.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { optionsSaveFileTransactions, validatorFileTransactions } from '@/config/module-multer-file-spreadsheet.config.js';
import { ImportTransctionsDTO } from './dto/import-transctions.dto.js';
import { CreateImportUseCase } from './use-cases/create-import.use-case.js';
import type { Request } from 'express';
import { ImportTransactionsEvent } from './interfaces/import-transactions.event.js';
// import { ImportTransactionsUseCase } from './use-cases/process-import-transactions.use-case.js';

@Controller('transactions')
export class TransactionsController {
    constructor(
        @Inject(CreateImportUseCase)
        private readonly createImportUseCase: CreateImportUseCase,
        @Inject(ImportTransactionsEvent)
        private readonly importTransactionEvent: ImportTransactionsEvent
    ) {

    }

    @Post('import')
    @HttpCode(202)
    @UseGuards(AuthJWT)
    @UseInterceptors(FileInterceptor('spreadsheet', optionsSaveFileTransactions))
    async import(@UploadedFile(validatorFileTransactions) file: Express.Multer.File, @Body() importDTO: ImportTransctionsDTO, @Req() request: Request) {
        const [importID, extension] = file.filename.split('.');

        await this.createImportUseCase.execute({
            importID,
            bank: importDTO.bank,
            extension,
            userID: request.userID
        });

        return {
            importID,
            status: 'PENDING'
        }
    }

    @Sse('events-import')
    @UseGuards(AuthJWT)
    eventsImport(@Req() request: Request) {
        return this.importTransactionEvent.subscribe(request.userID);
    }
}
