import { Injectable } from "@nestjs/common";
import { TransactionImportQueue } from "../../interfaces/transaction-import.queue.js";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class TransactionQueueuProducer implements TransactionImportQueue {
    constructor(
        @InjectQueue('import-transactions')
        private readonly queue: Queue
    ) { }

    async enqueue(importID: string, bank: string, extension: string, userID: string): Promise<void> {
        this.queue.add('import-transactions',
            { importID, bank, extension, userID },
            {
                jobId: importID,
                attempts: 1,
                backoff: {
                    type: 'exponential',
                    delay: 5000
                },
                removeOnComplete: {
                    age: 3600,
                    count: 3
                },
                removeOnFail: {
                    age: 86400,
                }
            }
        )
    }

}
