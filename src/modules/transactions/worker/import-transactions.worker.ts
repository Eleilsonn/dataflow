import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ProcessImportTransactionsUseCase } from "../use-cases/process-import-transactions.use-case.js";

@Processor('import-transactions')
export class ImportTransactionsWorker extends WorkerHost {
    constructor(
        private readonly processImportTransactionsUseCase: ProcessImportTransactionsUseCase
    ) {
        super()
    }
    async process(job: Job, token?: string): Promise<void> {
        const { importID, extension, bank, userID } = job.data;
        const filename = `${importID}.${extension}`;
        await this.processImportTransactionsUseCase.execute({
            filename,
            bank,
            importID,
            job,
            userID
        });
    }

}
