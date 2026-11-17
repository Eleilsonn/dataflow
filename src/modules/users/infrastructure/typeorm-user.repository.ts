import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDTO } from "../dto/create-user.dto.js";
import { ICreateUserData, IResultFindByEmailUserRepository, UserRepository } from "../interfaces/user-repository.interface.js";
import { UserEntity } from "./user.entity.js";
import { Repository } from "typeorm";

export class TypeOrmUserRepository implements UserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>
    ) { }

    async findByEmail(email: string): Promise<IResultFindByEmailUserRepository | null> {
        const userFound = await this.repository.findOne({
            where: {
                email,
                deleted: false
            },
            select: {
                id: true,
                email: true,
                password: true
            }
        });

        return userFound;
    }

    async create(data: ICreateUserData): Promise<void> {
        const user = this.repository.create(data);
        await this.repository.save(user);
    }

}
