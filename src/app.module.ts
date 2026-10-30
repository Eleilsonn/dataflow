import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { UsersModule } from '@/modules/users/users.module.js';
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import ConfigModuleTypeORMOption from '@/config/ConfigModuleTypeORMOptions.js';
import ConfigModuleOptions from '@/config/ConfigModuleOptions.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'dataflow',
    // }),
    ConfigModule.forRoot(ConfigModuleOptions),
    TypeOrmModule.forRoot(ConfigModuleTypeORMOption),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
