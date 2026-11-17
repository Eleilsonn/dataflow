import { IsEmail, MinLength } from "class-validator";

export class LoginDTO {
    @IsEmail(undefined, { message: 'Informe um e-mail valido' })
    email: string;
    @MinLength(8, { message: 'A senha conter no minimo 8 caracteres' })
    password: string;
}
