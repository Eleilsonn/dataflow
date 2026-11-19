import { CreateImportHistoryDTO } from "../dto/create-import-history.dto.js";
import { ImportHistoryEntity, StatusImport } from "../infrastructure/files-imported.entity.js";

export interface IUpdateImportHistory {
    status?: StatusImport;
    start?: Date;
    finish?: Date;
    count_records?: number;
    reason_error?: string;
    divergent_columns?: Array<string>;
}

export abstract class ImportHistoryRepository {
    abstract create(createImportHistoryDTO: CreateImportHistoryDTO): Promise<{ id: string }>;
    abstract updateByImportID(importID: string, data: IUpdateImportHistory): Promise<void>;
}
