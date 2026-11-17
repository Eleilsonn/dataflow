import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/infrastructure/user.entity.js';
import { LoginUseCase } from './use-cases/login.use-case.js';
import { UserRepository } from '../users/interfaces/user-repository.interface.js';
import { TypeOrmUserRepository } from '../users/infrastructure/typeorm-user.repository.js';

@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  providers: [
    LoginUseCase,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository
    }
  ]
})
export class AuthModule { }
