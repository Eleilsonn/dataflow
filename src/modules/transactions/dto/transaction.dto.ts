import { IsDate, IsEnum, IsOptional, isUUID, IsUUID, Min } from "class-validator";
import { CurrencyAcceptedTransaction, StatusTransaction } from "../infrastructure/entities/transction.entity.js";

export class TransactionDTO {
    bank: string;

    @IsUUID('4', { message: 'o transaction_id deve ser UUID' })
    transaction_id: string;

    @IsUUID('4', { message: 'o account_id deve ser UUID' })
    account_id: string;

    @Min(1)
    amount: number;

    @IsEnum(CurrencyAcceptedTransaction, { message: 'Currency diferente do esperado' })
    currency: CurrencyAcceptedTransaction;

    transaction_type: string;

    @IsEnum(StatusTransaction, { message: 'Status diferente do esperado' })
    status: string;

    @IsDate()
    created_at: Date;

    @IsOptional()
    description: string;

    @IsUUID()
    import_id: string;
}
