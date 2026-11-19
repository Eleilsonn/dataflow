import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/infrastructure/entities/user.entity.js';
import { LoginUseCase } from './use-cases/login.use-case.js';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            execute: vi.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
