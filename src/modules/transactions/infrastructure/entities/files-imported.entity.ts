import { UserEntity } from "../../../users/infrastructure/entities/user.entity.js";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";

export enum StatusImport {
    PENDING = 'peding',
    PROCESSING = 'processing',
    CONCLUDED = 'concluded',
    ERROR = 'error'
}

@Entity('import_history')
export class ImportHistoryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250 })
    filename: string;

    @Column({ type: "varchar", length: 50 })
    import_id: string;

    @Column({ type: 'enum', enum: StatusImport })
    status: StatusImport;

    @Column({ type: 'timestamp', nullable: true })
    start: Date;

    @Column({ type: 'timestamp', nullable: true })
    finish: Date;

    @Column({ type: 'integer', nullable: true })
    count_records: number;

    @Column({ type: 'text', nullable: true })
    reason_error: string;

    @Column({ type: 'jsonb', array: true, nullable: true })
    divergent_columns: Array<string>;

    @ManyToOne(() => UserEntity, (user) => user.imports)
    @JoinColumn({ referencedColumnName: 'id', name: 'created_by' })
    created_by: Relation<UserEntity>;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
