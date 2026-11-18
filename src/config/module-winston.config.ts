import { WinstonModuleOptions } from 'nest-winston';
import path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const dirLogs = './src/logs';

const options: WinstonModuleOptions = {
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
            ),
        }),
        new winston.transports.DailyRotateFile({
            level: 'info',
            filename: dirLogs + '/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
}

export default options
