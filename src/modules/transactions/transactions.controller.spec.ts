import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller.js';
import { CreateImportUseCase } from './use-cases/create-import.use-case.js';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: CreateImportUseCase,
          useValue: {
            execute: vi.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
