import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDTO } from "../dto/login.dto.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from "@/env/validation.env.js";
import { UserRepository } from "@/modules/users/interfaces/user-repository.interface.js";


@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository
    ) {

    }
    async execute(data: LoginDTO) {
        const userFound = await this.userRepository.findByEmail(data.email);

        if (!userFound)
            throw new UnauthorizedException('Nenhum usuário encontrado com este e-mail');

        const verifyPassword = bcrypt.compareSync(data.password, userFound.password);

        if (!verifyPassword)
            throw new UnauthorizedException('Senha de acesso informada não confere');

        const accessToken = jwt.sign({ userID: userFound.id, email: userFound.email }, env.PRIVATE_JWT, {
            subject: userFound.id,
            expiresIn: '12h'
        });

        return { accessToken, type: 'Bearer' }
    }
}
