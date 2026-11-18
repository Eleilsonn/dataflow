import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/transction.entity.js';
import { TypeOrmTransactionsRepository } from './infrastructure/typeorm-transactions.repository.js';
import { TransactionRepository } from './interfaces/transaction-repository.js';
import { CheckMetrics } from '@/utils/check-metrics.js';
import { ProcessImportTransactionsUseCase } from './use-cases/process-import-transactions.use-case.js';
import { TransactionImportQueue } from './interfaces/transaction-import.queue.js';
import { TransactionQueueuProducer } from './infrastructure/transaction-queue.producer.js';
import { queueImportTransactionRegister } from '@/config/module-bullmq.config.js';
import { ImportTransactionsWorker } from './worker/import-transactions.worker.js';
import { CreateImportUseCase } from './use-cases/create-import.use-case.js';

@Module({
  controllers: [TransactionsController],
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    queueImportTransactionRegister
  ],
  providers: [
    ProcessImportTransactionsUseCase,
    CreateImportUseCase,
    CheckMetrics,
    ImportTransactionsWorker,
    {
      provide: TransactionRepository,
      useClass: TypeOrmTransactionsRepository
    },
    {
      provide: TransactionImportQueue,
      useClass: TransactionQueueuProducer
    }
  ]
})
export class TransactionsModule { }
