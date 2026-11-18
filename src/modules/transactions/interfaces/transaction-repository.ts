import { TransactionDTO } from "../dto/transaction.dto.js";

export abstract class TransactionRepository {
    abstract createMany(data: Array<TransactionDTO>): Promise<void>
}
