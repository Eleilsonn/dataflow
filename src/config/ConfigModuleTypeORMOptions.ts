import { databaseConfig } from '@/infrastructure/database/data-source.js';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';


const options: TypeOrmModuleOptions = {
    ...databaseConfig,
    autoLoadEntities: true,
    migrations: []
}

export default options;
