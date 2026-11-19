
import { TransactionRepository } from "../interfaces/transaction-repository.js";
import { ProcessImportTransactionsUseCase } from "./process-import-transactions.use-case.js";
import { vi } from 'vitest';
import * as generateCSV from '@/utils/generate-csv-faker.js';
import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import fs from 'fs';
import { ImportHistoryRepository, IUpdateImportHistory } from "../interfaces/import-history.repository.js";
import { StatusImport } from "../infrastructure/entities/files-imported.entity.js";
import { Job } from "bullmq";

describe('ProcessImportTransactionsUseCase', () => {
    let useCase: ProcessImportTransactionsUseCase;
    let insertedBatches: string[][] = [];
    let importIDDeleted: string[] = [];
    let statusAltered: StatusImport[] = [];
    let userID: string = 'teste-id'

    const repositoryMock = {
        createMany: vi.fn().mockImplementation(async (batch) => {
            insertedBatches.push(batch);
        }),
        deleteByImportID: vi.fn().mockImplementation(async (importID) => {
            importIDDeleted.push(importID)
        })
    }

    const importHistoryRepositoryMock = {
        create: vi.fn(),
        updateByImportID: vi.fn().mockImplementation((importID: string, data: IUpdateImportHistory) => {
            statusAltered.push(data.status!);
        }),
    }

    const job = {
        updateProgress: vi.fn()
    }

    const serviceLogger = {
        log: vi.fn()
    }

    beforeEach(async () => {
        vitest.clearAllMocks();
        insertedBatches = [];
        importIDDeleted = [];
        statusAltered = [];

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProcessImportTransactionsUseCase,
                {
                    provide: TransactionRepository,
                    useValue: repositoryMock
                },
                {
                    provide: ImportHistoryRepository,
                    useValue: importHistoryRepositoryMock
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

        const totalRecords = 100;
        const importID = crypto.randomUUID();
        const filename = await generateCSV.generateInvalidCSV(headerInvalid, totalRecords, importID);

        await expect(
            useCase.execute({ filename, bank: 'teste', importID, job: (job as any) as Job, userID })
        ).rejects.toThrow('O csv está com o head fora do padrão esperado')
            .finally(() => {
                const folderFile = `./tmp/${filename}`;
                if (fs.existsSync(folderFile))
                    fs.unlinkSync(folderFile);
            });
    });

    it('Deve parar importação de o csv tiver uma linha com valores diferentes do esperado', async () => {
        const headerInvalid = [
            'transaction_id',
            'account_id',
            'amount',
            'currency',
            'transaction_type',
            'status',
            'created_at',
            'description',
        ];

        const totalRecords = 100;
        const importID = crypto.randomUUID();
        const columnsWithValueWrong = 'status';

        const filename = await generateCSV.generateInvalidCSV(headerInvalid, totalRecords, importID, columnsWithValueWrong);

        await expect(
            useCase.execute({ filename, bank: 'teste', importID, job: (job as any) as Job, userID })
        ).rejects.toThrow('Existem linhas que não seguem o padrão esperado')
            .finally(() => {
                const folderFile = `./tmp/${filename}`;
                if (fs.existsSync(folderFile))
                    fs.unlinkSync(folderFile);
            });
    });

    it('deve persistir 4500 registros em 3 lotes', async () => {
        const headerInvalid = [
            'transaction_id',
            'account_id',
            'amount',
            'currency',
            'transaction_type',
            'status',
            'created_at',
            'description',
        ];

        const totalRecords = 4500;
        const importID = crypto.randomUUID();

        const filename = await generateCSV.generateInvalidCSV(headerInvalid, totalRecords, importID);

        await useCase.execute({ bank: 'teste', filename, importID, job: (job as any) as Job, userID })
            .finally(() => {
                const folderFile = `./tmp/${filename}`;
                if (fs.existsSync(folderFile))
                    fs.unlinkSync(folderFile);
            });

        expect(repositoryMock.createMany).toHaveBeenCalledTimes(3);

        expect(insertedBatches.map(batch => batch.length))
            .toEqual([2000, 2000, 500]);
    });

    it('deve deletar registros persistidos caso encontre um registro com erro', async () => {
        const headerInvalid = [
            'transaction_id',
            'account_id',
            'amount',
            'currency',
            'transaction_type',
            'status',
            'created_at',
            'description',
        ];

        const totalRecords = 100;
        const importID = crypto.randomUUID();
        const columnsWithValueWrong = 'status';
        const quantRowWithValueWrong = 2;

        const filename = await generateCSV.generateInvalidCSV(headerInvalid, totalRecords, importID, columnsWithValueWrong, quantRowWithValueWrong);

        await useCase.execute({ bank: 'teste', filename, importID, job: (job as any) as Job, userID })
            .catch(err => { })
            .finally(() => {
                const folderFile = `./tmp/${filename}`;
                if (fs.existsSync(folderFile))
                    fs.unlinkSync(folderFile);
            });

        expect(repositoryMock.deleteByImportID).toHaveBeenCalledTimes(1);
        expect(importIDDeleted).toEqual([importID]);
    })

    it('deve interromper a importação caso alguma coluna de header estiver fora do padrão esperado', async () => {
        //coluna status com nome diferente do esperado
        const headerInvalid = [
            'transaction_id',
            'account_id',
            'amount',
            'currency',
            'transaction_type',
            'status_2',
            'created_at',
            'description',
        ];

        const totalRecords = 100;
        const importID = crypto.randomUUID();

        const filename = await generateCSV.generateInvalidCSV(headerInvalid, totalRecords, importID);

        expect(useCase.execute({ bank: 'test', filename, importID, job: (job as any) as Job, userID }))
            .rejects.toThrow('Algumas colunas do header estão com a descrição diferente do esperado. (status_2 => status)')
            .finally(() => {
                const folderFile = `./tmp/${filename}`;
                if (fs.existsSync(folderFile))
                    fs.unlinkSync(folderFile);
            });
    })

    it('deve atualizar o status duas vezes', async () => {
        const headerInvalid = [
            'transaction_id',
            'account_id',
            'amount',
            'currency',
            'transaction_type',
            'status',
            'created_at',
            'description',
        ];

        const totalRecords = 100;
        const importID = crypto.randomUUID();

        const filename = await generateCSV.generateInvalidCSV(headerInvalid, totalRecords, importID);

        await useCase.execute({ bank: 'teste', filename, importID, job: (job as any) as Job, userID })
            .finally(() => {
                const folderFile = `./tmp/${filename}`;
                if (fs.existsSync(folderFile))
                    fs.unlinkSync(folderFile);
            });

        expect(importHistoryRepositoryMock.updateByImportID).toHaveBeenCalledTimes(2);

        expect(statusAltered).toEqual([StatusImport.PROCESSING, StatusImport.CONCLUDED]);
    });
})
