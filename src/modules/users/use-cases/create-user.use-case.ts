import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { CreateUserDTO } from "../dto/create-user.dto.js";
import { UserRepository } from "../interfaces/user-repository.interface.js";
import bcrypt from 'bcrypt';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository
    ) { }
    async execute(data: CreateUserDTO) {
        const userAlreadExist = await this.userRepository.findByEmail(data.email);

        if (userAlreadExist)
            throw new ConflictException('E-mail do usuário já cadastrado');

        const salt = 12;
        const passwordHash = bcrypt.hashSync(data.password, salt);

        await this.userRepository.create({
            name: data.name,
            email: data.email,
            password: passwordHash
        });
    }
}
