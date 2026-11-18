import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { UsersModule } from '@/modules/users/users.module.js';
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module.js';
import ConfigModuleTypeORMOption from '@/config/module-typeORM-options.config.js';
import ConfigModuleOptions from '@/config/module-options.config.js';
import ConfigModuleWinston from '@/config/module-winston.config.js';
import ConfigModuleBullMQ from '@/config/module-bullmq.config.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { WinstonModule } from 'nest-winston';
import { BullModule } from '@nestjs/bullmq';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot(ConfigModuleOptions),
    TypeOrmModule.forRoot(ConfigModuleTypeORMOption),
    WinstonModule.forRoot(ConfigModuleWinston),
    BullModule.forRoot(ConfigModuleBullMQ),
    UsersModule,
    AuthModule,
    TransactionsModule,
  ],
  controllers: [
    AppController
  ],
})
export class AppModule { }
