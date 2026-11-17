import { IsOptional } from "class-validator";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export enum CurrencyAcceptedTransaction {
    BRL = 'BRL',
    USD = 'USD',
    EUR = 'EUR'
}
export enum StatusTransaction {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

@Entity('transactions')
export class TransactionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    bank: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    transaction_id: string;

    @Column({ type: 'varchar', length: 50 })
    account_id: string;

    @Column({ type: 'decimal', scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: CurrencyAcceptedTransaction, default: CurrencyAcceptedTransaction.BRL })
    currency: CurrencyAcceptedTransaction;

    @Column({ type: 'varchar' })
    transaction_type: string;

    @Column({ type: 'enum', enum: StatusTransaction })
    status: string;

    @Column({ type: 'timestamp' })
    created_at: Date;

    @Column({ type: 'text', nullable: true })
    description: string
}
