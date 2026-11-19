import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from "@nestjs/bullmq";
import { Inject } from "@nestjs/common";
import { IDataPublish, ImportTransactionsEvent } from "../../interfaces/import-transactions.event.js";

@QueueEventsListener('import-transactions')
export class TransactionsImportListener extends QueueEventsHost {
    constructor(
        @Inject(ImportTransactionsEvent)
        private readonly importTransactionEvent: ImportTransactionsEvent
    ) { super() }

    @OnQueueEvent('progress')
    onProgress({ jobId, data }: { jobId: string, data: IDataPublish }) {
        this.importTransactionEvent.publish(data.userID, data);
    }
}
