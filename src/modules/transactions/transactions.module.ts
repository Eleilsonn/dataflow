import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/entities/transction.entity.js';
import { TypeOrmTransactionsRepository } from './infrastructure/repositories/typeorm-transactions.repository.js';
import { TransactionRepository } from './interfaces/transaction-repository.js';
import { CheckMetrics } from '@/utils/check-metrics.js';
import { ProcessImportTransactionsUseCase } from './use-cases/process-import-transactions.use-case.js';
import { TransactionImportQueue } from './interfaces/transaction-import.queue.js';
import { TransactionQueueuProducer } from './infrastructure/queue/transaction-queue.producer.js';
import { queueImportTransactionRegister } from '@/config/module-bullmq.config.js';
import { ImportTransactionsWorker } from './worker/import-transactions.worker.js';
import { CreateImportUseCase } from './use-cases/create-import.use-case.js';
import { ImportHistoryEntity } from './infrastructure/entities/files-imported.entity.js';
import { ImportHistoryRepository } from './interfaces/import-history.repository.js';
import { TypeOrmImportHistoryRepository } from './infrastructure/repositories/typeorm-import-history.repository.js';
import { UserEntity } from '../users/infrastructure/entities/user.entity.js';
import { TransactionsImportListener } from './infrastructure/queue/transaction-import.listener.js';
import { ImportTransactionsEvent } from './interfaces/import-transactions.event.js';
import { ImportTransactionsService } from './infrastructure/events/import-transactions.service.js';

@Module({
  controllers: [TransactionsController],
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, UserEntity, ImportHistoryEntity]),
    queueImportTransactionRegister
  ],
  providers: [
    ProcessImportTransactionsUseCase,
    CreateImportUseCase,
    CheckMetrics,
    ImportTransactionsWorker,
    TransactionsImportListener,
    {
      provide: TransactionRepository,
      useClass: TypeOrmTransactionsRepository
    },
    {
      provide: TransactionImportQueue,
      useClass: TransactionQueueuProducer
    },
    {
      provide: ImportHistoryRepository,
      useClass: TypeOrmImportHistoryRepository
    },
    {
      provide: ImportTransactionsEvent,
      useClass: ImportTransactionsService
    }
  ]
})
export class TransactionsModule { }
