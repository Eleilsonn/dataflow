import { ImportHistoryEntity } from "../../modules/transactions/infrastructure/files-imported.entity.js";
import { TransactionEntity } from "../../modules/transactions/infrastructure/transction.entity.js";
import { UserEntity } from "../../modules/users/infrastructure/user.entity.js";

export default [
    UserEntity,
    TransactionEntity,
    ImportHistoryEntity
]
