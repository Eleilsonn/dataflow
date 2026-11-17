import { CreateUserDTO } from "../dto/create-user.dto.js";

export interface ICreateUserData {
    name: string;
    email: string;
    password: string;
}

export interface IResultFindByEmailUserRepository {
    id: string;
    email: string;
    password: string;
}

export abstract class UserRepository {
    abstract create(data: ICreateUserData): Promise<void>;
    abstract findByEmail(email: string): Promise<IResultFindByEmailUserRepository | null>;
}
