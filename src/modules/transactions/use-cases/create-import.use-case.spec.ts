import { Test, TestingModule } from "@nestjs/testing";
import { CreateImportUseCase } from "./create-import.use-case.js"
import { ImportHistoryRepository } from "../interfaces/import-history.repository.js";
import { TransactionImportQueue } from "../interfaces/transaction-import.queue.js";

describe('CreateImportUseCase', () => {
    let useCase: CreateImportUseCase;

    const importHistoryRepositoryMock = {
        create: vi.fn(),
        updateByImportID: vi.fn(),
    }

    const transactionImportQueue = {
        enqueue: vi.fn()
    }


    beforeEach(async () => {
        vitest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateImportUseCase,
                {
                    provide: ImportHistoryRepository,
                    useValue: importHistoryRepositoryMock
                },
                {
                    provide: TransactionImportQueue,
                    useValue: transactionImportQueue
                }
            ]
        }).compile();

        useCase = module.get<CreateImportUseCase>(CreateImportUseCase)
    });

    it('deve criar o registro na table import_history', async () => {
        const importID = crypto.randomUUID();
        const extension = 'csv';
        const bank = 'teste';
        const userID = 'abcd';

        await useCase.execute({
            importID,
            extension,
            bank,
            userID
        });

        expect(importHistoryRepositoryMock.create).toHaveBeenCalledTimes(1);
    });

    it('deve adicionar a importação na fila de BullMq', async () => {
        const importID = crypto.randomUUID();
        const extension = 'csv';
        const bank = 'teste';
        const userID = 'abcd';

        await useCase.execute({
            importID,
            extension,
            bank,
            userID
        });

        expect(transactionImportQueue.enqueue).toHaveBeenCalledTimes(1);
    });

})
