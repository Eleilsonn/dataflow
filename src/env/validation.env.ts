import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
    DATABASE_HOST: z.string(),
    DATABASE_PORT: z.coerce.number(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_NAME: z.string()
})

const _env = envSchema.safeParse(process.env);
if (_env.success === false) {

    console.error('Invalid envionmente variables', z.treeifyError(_env.error));

    throw new Error('Invalid envionmente variables');

}

export const env = _env.data!;

export default envSchema;

