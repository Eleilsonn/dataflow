import { DataSource, DataSourceOptions } from "typeorm";
import { env } from "../../env/validation.env.js";
import EntityList from "./EntityList.js";

const timeoutSeconds = 120;

export const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    username: env.DATABASE_USER,
    database: env.DATABASE_NAME,
    password: env.DATABASE_PASSWORD,
    entities: EntityList,
    migrations: ['src/infrastructure/database/migrations/*.ts',],
    migrationsRun: false,
    synchronize: false,
    connectTimeoutMS: timeoutSeconds * 1000
}

export default new DataSource(databaseConfig);
