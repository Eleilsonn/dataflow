import { Test, TestingModule } from "@nestjs/testing"
import { ICreateUserData, UserRepository } from "../interfaces/user-repository.interface.js"
import { CreateUserUseCase } from "./create-user.use-case.js"
import { rejects } from "assert";

describe('CreateUserUseCase', async () => {
    let useCase: CreateUserUseCase;
    let passwordCripted: string[] = []
    const userRepositoryMock = {
        create: vi.fn().mockImplementation((data: ICreateUserData) => passwordCripted.push(data.password)),
        findByEmail: vi.fn().mockImplementationOnce((email: string) => {
            return email.indexOf('user-exist') > -1 ? { name: 'anywhere' } : null
        })
    }

    let user = {
        name: 'anywhere',
        email: 'teste@teste.com',
        password: '123456'
    }

    beforeEach(async () => {

        passwordCripted = [];

        user = {
            name: 'anywhere',
            email: 'teste@teste.com',
            password: '123456'
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateUserUseCase,
                {
                    provide: UserRepository,
                    useValue: userRepositoryMock
                }
            ]
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    });

    it('deve da erro de usuário já cadastrado', async () => {
        user.email = 'user-exist@teste.com';

        await expect(useCase.execute(user))
            .rejects.toThrow('E-mail do usuário já cadastrado')
    });

    it('a senha deve estar estar criptografada', async () => {
        await useCase.execute(user);

        expect(passwordCripted).not.toEqual([user.password]);
    })
})
