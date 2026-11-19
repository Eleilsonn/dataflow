import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterColumnsImportHistory21795049272539 implements MigrationInterface {
    name = 'AlterColumnsImportHistory21795049272539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_256fbeaa92a670f650803246e2b"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP COLUMN "importID"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD "import_id" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_a908bd63d9c20a49da6108fbae5" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_a908bd63d9c20a49da6108fbae5"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP COLUMN "import_id"`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD "createdById" uuid`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD "importID" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_256fbeaa92a670f650803246e2b" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
