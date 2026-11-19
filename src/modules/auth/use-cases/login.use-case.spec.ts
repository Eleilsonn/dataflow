import { Test, TestingModule } from "@nestjs/testing"
import { LoginUseCase } from "./login.use-case.js"
import { UserRepository } from "@/modules/users/interfaces/user-repository.interface.js"

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;
    const userRepositoryMock = {
        create: vi.fn(),
        findByEmail: vi.fn().mockImplementationOnce((email: string) => {
            return email.indexOf('user-exist') > -1 ? { name: 'anywhere', password: '$2b$12$MDc44nS4IyCldRq6gYMYJ.DTRotBbicb8cGz5ZNa8htFuf2yRtxJq' } : null
        })
    }

    let user = {
        name: 'anywhere',
        email: 'teste@teste.com',
        password: '123456'
    }

    beforeEach(async () => {
        user = {
            name: 'anywhere',
            email: 'teste@teste.com',
            password: '123456'
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginUseCase, {
                    provide: UserRepository,
                    useValue: userRepositoryMock
                }
            ]
        }).compile();


        useCase = module.get<LoginUseCase>(LoginUseCase);
    });

    it('deve retornar erro se a senha estiver errada', async () => {
        user.email = 'user-exist@teste.com';
        await expect(useCase.execute(user))
            .rejects.toThrow('Senha de acesso informada não confere')
    });

    it('deve retornar erro se o nenhum usuário for encontrado', async () => {
        await expect(useCase.execute(user))
            .rejects.toThrow('Nenhum usuário encontrado com este e-mail')
    });
})
