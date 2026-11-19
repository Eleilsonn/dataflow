import { ImportHistoryEntity } from "../../modules/transactions/infrastructure/entities/files-imported.entity.js";
import { TransactionEntity } from "../../modules/transactions/infrastructure/entities/transction.entity.js";
import { UserEntity } from "../../modules/users/infrastructure/entities/user.entity.js";

export default [
    UserEntity,
    TransactionEntity,
    ImportHistoryEntity
]
