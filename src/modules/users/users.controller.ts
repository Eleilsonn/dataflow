import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateUserUseCase } from './use-cases/create-user.use-case.js';
import { CreateUserDTO } from './dto/create-user.dto.js';

@Controller('users')
export class UsersController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase
    ) { }

    @Post()
    @HttpCode(201)
    async create(@Body() dto: CreateUserDTO) {
        await this.createUserUseCase.execute(dto);
    }
}
