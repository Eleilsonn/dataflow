import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterIdUser1793390739194 implements MigrationInterface {
    name = 'AlterIdUser1793390739194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
    }

}
