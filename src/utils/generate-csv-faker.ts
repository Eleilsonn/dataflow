import { faker } from '@faker-js/faker';
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';
import path from 'node:path';

const TOTAL_RECORDS = 1_000_000;

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

    const filePath = path.resolve(import.meta.dirname, '..', '..', 'tmp', 'transactions-faker.csv');
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

generateCSV().catch(console.error);
