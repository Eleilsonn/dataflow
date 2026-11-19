import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountRecordsImportHistory1795046198960 implements MigrationInterface {
    name = 'AddCountRecordsImportHistory1795046198960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "import_history" ADD "count_records" integer`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP COLUMN "count_records"`);
    }

}
