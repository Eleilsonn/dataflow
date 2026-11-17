import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterNullabelUsersField1793390431233 implements MigrationInterface {
    name = 'AlterNullabelUsersField1793390431233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_by" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_by" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_at" SET NOT NULL`);
    }

}
