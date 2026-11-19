import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableImportHistory1795031987736 implements MigrationInterface {
    name = 'CreateTableImportHistory1795031987736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."import_history_status_enum" AS ENUM('peding', 'processing', 'concluded', 'error')`);
        await queryRunner.query(`CREATE TABLE "import_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying(250) NOT NULL, "importID" character varying(50) NOT NULL, "status" "public"."import_history_status_enum" NOT NULL, "start" TIMESTAMP, "finish" TIMESTAMP, "reason_error" text, "divergent_columns" jsonb array, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "createdById" uuid, CONSTRAINT "PK_18a2e880c124ce5283b6ca6fc98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_256fbeaa92a670f650803246e2b" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_256fbeaa92a670f650803246e2b"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric`);
        await queryRunner.query(`DROP TABLE "import_history"`);
        await queryRunner.query(`DROP TYPE "public"."import_history_status_enum"`);
    }

}
