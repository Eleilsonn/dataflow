import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnImportedAt1794943600461 implements MigrationInterface {
    name = 'AddColumnImportedAt1794943600461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "imported_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "UQ_d70b5c1cf157c6e2c47d20c0953"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "UQ_d70b5c1cf157c6e2c47d20c0953" UNIQUE ("import_id")`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "imported_at"`);
    }

}
