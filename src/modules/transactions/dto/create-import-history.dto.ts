import { UserEntity } from "@/modules/users/infrastructure/entities/user.entity.js";
import { StatusImport } from "../infrastructure/entities/files-imported.entity.js";
import { IsOptional, IsUUID } from "class-validator";

export class CreateImportHistoryDTO {

    filename: string;

    @IsUUID()
    import_id: string;

    status: StatusImport;

    created_by: UserEntity;
}
