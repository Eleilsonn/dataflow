import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnImportIdToTransactions1794943260474 implements MigrationInterface {
    name = 'AddColumnImportIdToTransactions1794943260474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "import_id" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "UQ_d70b5c1cf157c6e2c47d20c0953" UNIQUE ("import_id")`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "UQ_d70b5c1cf157c6e2c47d20c0953"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "import_id"`);
    }

}
