import { ImportHistoryEntity } from "../../../transactions/infrastructure/entities/files-imported.entity.js";
import { IsOptional } from "class-validator";
import { Column, Entity, IsNull, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250 })
    name: string;

    @Column({ type: 'varchar', length: 400 })
    password: string;

    @Column({ type: 'varchar', length: 250, unique: true })
    email: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'boolean', default: false })
    deleted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    deleted_at: Date | null;

    @Column({ type: 'varchar', nullable: true })
    @IsOptional()
    deleted_by: string | null;

    @OneToMany(() => ImportHistoryEntity, (importFile) => importFile.created_by)
    imports: Relation<ImportHistoryEntity[]>
}
