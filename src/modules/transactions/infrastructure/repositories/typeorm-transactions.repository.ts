import { InjectRepository } from "@nestjs/typeorm";
import { TransactionEntity } from "../entities/transction.entity.js";
import { Repository } from "typeorm";
import { TransactionRepository } from "../../interfaces/transaction-repository.js";
import { TransactionDTO } from "../../dto/transaction.dto.js";

export class TypeOrmTransactionsRepository implements TransactionRepository {
    constructor(
        @InjectRepository(TransactionEntity)
        private readonly repository: Repository<TransactionEntity>
    ) { }

    async deleteByImportID(importID: string): Promise<void> {
        await this.repository.delete({ import_id: importID });
    }

    async createMany(data: Array<TransactionDTO>): Promise<{ count_saved: number }> {

        const transactions = await data.map(item => this.repository.create(item));

        const transactionsSaved = await this.repository.createQueryBuilder()
            .insert()
            .values(transactions)
            .orIgnore()
            .execute();

        const count_saved = transactionsSaved.raw.length;

        return { count_saved }
    }
}
