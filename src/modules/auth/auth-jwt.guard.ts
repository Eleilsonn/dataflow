import { env } from "@/env/validation.env.js";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from 'express';
import jwt, { JsonWebTokenError, JwtHeader, JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthJWT implements CanActivate {
    private static privateKey: string;
    constructor() {
        if (!AuthJWT.privateKey)
            AuthJWT.privateKey = env.PRIVATE_JWT;
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();

        const tokenAcess = request.headers.authorization?.replace('Bearer ', '');

        if (!tokenAcess)
            throw new UnauthorizedException('Token não informado');
        try {
            const decodedToken = jwt.verify(tokenAcess, AuthJWT.privateKey) as JwtPayload & { userID: string };
            request.userID = decodedToken.userID;

            return true
        } catch (error: any) {
            const message = this.handleMessageError(error)
            throw new UnauthorizedException(message);
        }
    }

    private handleMessageError(error: JsonWebTokenError) {
        switch (error.message) {
            case 'invalid token':
                return 'Token inválido';
            case 'jwt signature is required':
                return 'O token não possui assinatura';
            case 'jwt malformed':
                return 'Token mal formado';
            case 'invalid signature':
                return 'Token inválido';
            case 'jwt expired':
                return 'Acesso expirado, faça o login novamente'
            default:
                return 'Error inesperado ao verificar o token de acesso'
        }
    }
}
