import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { TransactionImportQueue } from "../interfaces/transaction-import.queue.js";
import { ImportHistoryRepository } from "../interfaces/import-history.repository.js";
import { CreateImportHistoryDTO } from "../dto/create-import-history.dto.js";
import { StatusImport } from "../infrastructure/files-imported.entity.js";
import { UserEntity } from "@/modules/users/infrastructure/user.entity.js";

type TypeData = {
    importID: string;
    extension: string;
    bank: string;
    userID: string;
}

@Injectable()
export class CreateImportUseCase {
    constructor(
        @Inject(TransactionImportQueue)
        private readonly transactionImportQueue: TransactionImportQueue,
        @Inject(ImportHistoryRepository)
        private readonly importHistoryRepository: ImportHistoryRepository
    ) {

    }
    async execute(data: TypeData) {
        const { importID, bank, extension } = data;

        const user: Partial<UserEntity> = {
            id: data.userID
        }

        const createData: CreateImportHistoryDTO = {
            filename: `${data.importID}.${data.extension}`,
            import_id: data.importID,
            status: StatusImport.PENDING,
            created_by: user as UserEntity
        }

        await this.importHistoryRepository.create(createData);
        await this.transactionImportQueue.enqueue(importID, bank, extension);
    }
}
