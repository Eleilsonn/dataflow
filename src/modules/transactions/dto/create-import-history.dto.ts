import { UserEntity } from "@/modules/users/infrastructure/user.entity.js";
import { StatusImport } from "../infrastructure/files-imported.entity.js";
import { IsOptional, IsUUID } from "class-validator";

export class CreateImportHistoryDTO {

    filename: string;

    @IsUUID()
    import_id: string;

    status: StatusImport;

    created_by: UserEntity;
}
