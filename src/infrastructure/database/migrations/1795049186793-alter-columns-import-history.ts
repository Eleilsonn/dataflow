import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterColumnsImportHistory1795049186793 implements MigrationInterface {
    name = 'AlterColumnsImportHistory1795049186793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
    }

}
