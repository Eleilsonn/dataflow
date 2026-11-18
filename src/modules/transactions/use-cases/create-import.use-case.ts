import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { TransactionImportQueue } from "../interfaces/transaction-import.queue.js";

type TypeData = {
    importID: string;
    extension: string;
    bank: string;
}

@Injectable()
export class CreateImportUseCase {
    constructor(
        @Inject(TransactionImportQueue)
        private readonly transactionImportQueue: TransactionImportQueue
    ) {

    }
    async execute(data: TypeData) {
        const { importID, bank, extension } = data;
        await this.transactionImportQueue.enqueue(importID, bank, extension);
    }
}
