import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/transction.entity.js';
import { TypeOrmTransactionsRepository } from './infrastructure/typeorm-transactions.repository.js';
import { ImportTransactionsUseCase } from './use-cases/import-transactions.use-case.js';
import { TransactionRepository } from './interfaces/TransactionRepository.js';

@Module({
  controllers: [TransactionsController],
  imports: [
    TypeOrmModule.forFeature([TransactionEntity])
  ],
  providers: [
    ImportTransactionsUseCase,
    {
      provide: TransactionRepository,
      useClass: TypeOrmTransactionsRepository
    }
  ]
})
export class TransactionsModule { }
