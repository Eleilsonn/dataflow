import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/user.entity.js';
import { CreateUserUseCase } from './use-cases/create-user.use-case.js';
import { TypeOrmUserRepository } from './infrastructure/typeorm-user.repository.js';
import { UserRepository } from './interfaces/user-repository.interface.js';

@Module({
  controllers: [UsersController],
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    CreateUserUseCase,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository
    }
  ]
})
export class UsersModule { }
