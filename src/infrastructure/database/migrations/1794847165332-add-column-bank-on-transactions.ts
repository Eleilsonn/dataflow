import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnBankOnTransactions1794847165332 implements MigrationInterface {
    name = 'AddColumnBankOnTransactions1794847165332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "bank" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "bank"`);
    }

}
