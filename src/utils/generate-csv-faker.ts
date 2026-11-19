import { faker } from '@faker-js/faker';
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';
import path from 'node:path';
import { uuidv4 } from 'zod';

const TOTAL_RECORDS = 100000;

const headers = [
    'transaction_id',
    'account_id',
    'amount',
    'currency',
    'transaction_type',
    'status',
    'created_at',
    'description',
];

async function generateCSV() {

    const filePath = path.resolve(import.meta.dirname, '..', '..', 'tmp', 'transactions-faker-100k.csv');
    const stream = createWriteStream(filePath);

    stream.write(headers.join(',') + '\n');

    // Gera 100 contas para simular múltiplas transações por conta
    const accounts = Array.from(
        { length: 100 },
        () => faker.string.uuid(),
    );

    for (let i = 0; i < TOTAL_RECORDS; i++) {
        const row = [
            faker.string.uuid(),
            faker.helpers.arrayElement(accounts),
            faker.finance.amount({ min: 10, max: 10000, dec: 2 }),
            'BRL',
            faker.helpers.arrayElement(['credit', 'debit']),
            faker.helpers.arrayElement(['completed', 'pending', 'failed']),
            faker.date.recent({ days: 365 }).toISOString(),
            `Transaction ${i + 1}`,
        ];

        const line = row.join(',') + '\n';

        if (!stream.write(line)) {
            await once(stream, 'drain');
        }
    }

    stream.end();

    await once(stream, 'finish');

    console.log(`${TOTAL_RECORDS} registros gerados`);
}

export async function generateInvalidCSV(header: string[], total_records: number, importID: string, columnWithValueWrong?: string, quantColumnWithWrong?: number) {
    const filename = `${importID}-faker-test.csv`;
    const filePath = path.resolve(import.meta.dirname, '..', '..', 'tmp', filename);
    const stream = createWriteStream(filePath);

    stream.write(header.join(',') + '\n');

    // Gera 10 contas para simular múltiplas transações por conta
    const accounts = Array.from(
        { length: 10 },
        () => faker.string.uuid(),
    );
    let countColumnWithWrong = 0;
    for (let i = 0; i < total_records; i++) {
        const row = [];

        if (header.includes('transaction_id'))
            row.push(faker.string.uuid())
        if (header.includes('account_id'))
            row.push(faker.helpers.arrayElement(accounts))
        if (header.includes('amount'))
            row.push(faker.finance.amount({ min: 10, max: 10000, dec: 2 }))
        if (header.includes('currency'))
            row.push('BRL')
        if (header.includes('transaction_type'))
            row.push(faker.helpers.arrayElement(['credit', 'debit']))
        if (header.includes('status') || header.includes('status_2'))
            row.push(faker.helpers.arrayElement(['completed', 'pending', 'failed']))
        if (header.includes('created_at'))
            row.push(faker.date.recent({ days: 365 }).toISOString())
        if (header.includes('description'))
            row.push(`Transaction ${i + 1}`)

        if (columnWithValueWrong && (typeof quantColumnWithWrong === 'undefined' || countColumnWithWrong < quantColumnWithWrong)) {
            const indexRow = header.indexOf(columnWithValueWrong);

            row[indexRow] = faker.string.nanoid(8);
            countColumnWithWrong++;
        }

        const line = row.join(',') + '\n';

        if (!stream.write(line)) {
            await once(stream, 'drain');
        }
    }


    stream.end();

    await once(stream, 'finish');

    return filename;
}

generateCSV().catch(console.error);
