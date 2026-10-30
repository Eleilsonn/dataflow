import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250 })
    name: string;

    @Column({ type: 'varchar', length: 400 })
    password: string;

    @Column({ type: 'varchar', length: 250, unique: true })
    email: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp' })
    deleted_at: Date;

    @Column({ type: 'varchar' })
    deleted_by: string;
}
