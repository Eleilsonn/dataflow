import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnDeletedOnUser1793391003259 implements MigrationInterface {
    name = 'AddColumnDeletedOnUser1793391003259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted"`);
    }

}
