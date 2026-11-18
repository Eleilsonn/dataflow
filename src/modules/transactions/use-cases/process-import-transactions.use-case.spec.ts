import { Logger } from "@nestjs/common";
import { TransactionRepository } from "../interfaces/transaction-repository.js";
import { ProcessImportTransactionsUseCase } from "./process-import-transactions.use-case.js";
import { vi } from 'vitest';
import * as generateCSV from '@/utils/generate-csv-faker.js';
import { rejects } from "assert";
import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";


describe('ProcessImportTransactionsUseCase', () => {
    let useCase: ProcessImportTransactionsUseCase;
    const repositoryMock = {
        createMany: vi.fn()
    }

    const serviceLogger = {
        log: vi.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProcessImportTransactionsUseCase,
                {
                    provide: TransactionRepository,
                    useValue: repositoryMock
                },
                {
                    provide: WINSTON_MODULE_NEST_PROVIDER,
                    useValue: serviceLogger
                }
            ]
        }).compile();

        useCase = module.get<ProcessImportTransactionsUseCase>(ProcessImportTransactionsUseCase)
    })

    it('Deve rejeitar um CSV com header menor que o esperado', async () => {
        //sem coluna status
        const headerInvalid = [
            'transaction_id',
            'account_id',
            'amount',
            'currency',
            'transaction_type',
            'created_at',
            'description',
        ];

        const totalRecords = 2000;
        const importID = crypto.randomUUID();
        const filename = await generateCSV.generateInvalidCSV(headerInvalid, totalRecords, importID);

        await expect(
            useCase.execute({ filename, bank: 'teste', importID })
        ).rejects.toThrow('O csv está com o head fora do padrão esperado');
    });

    it('Deve parar importação de o csv tiver uma linha com valores diferentes do esperado', async () => {

    });

    it('deve persistir 4500 registros em 3 lotes', async () => {

    });
})
