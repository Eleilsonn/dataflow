import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactionTable1794847016330 implements MigrationInterface {
    name = 'CreateTransactionTable1794847016330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_currency_enum" AS ENUM('BRL', 'USD', 'EUR')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transaction_id" character varying(50) NOT NULL, "account_id" character varying(50) NOT NULL, "amount" numeric NOT NULL, "currency" "public"."transactions_currency_enum" NOT NULL DEFAULT 'BRL', "transaction_type" character varying NOT NULL, "status" "public"."transactions_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL, "description" text, CONSTRAINT "UQ_9162bf9ab4e31961a8f7932974c" UNIQUE ("transaction_id"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_currency_enum"`);
    }

}
