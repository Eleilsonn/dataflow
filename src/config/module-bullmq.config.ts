import { env } from '@/env/validation.env.js';
import { BullRootModuleOptions, BullModule } from '@nestjs/bullmq';

export const options: BullRootModuleOptions = {
    connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT
    },
}

export const queueImportTransactionRegister = BullModule.registerQueue({
    name: 'import-transactions'
})


export default options;
