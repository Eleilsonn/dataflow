import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto.js';
import { LoginUseCase } from './use-cases/login.use-case.js';
import { AuthJWT } from './auth-jwt.guard.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase
    ) {

    }
    @Post('login')
    @HttpCode(200)
    async login(@Body() data: LoginDTO) {
        return await this.loginUseCase.execute(data);
    }
}
