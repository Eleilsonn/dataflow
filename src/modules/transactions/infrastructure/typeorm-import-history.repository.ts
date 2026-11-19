import { Injectable } from "@nestjs/common";
import { CreateImportHistoryDTO } from "../dto/create-import-history.dto.js";
import { ImportHistoryRepository, IUpdateImportHistory } from "../interfaces/import-history.repository.js";
import { InjectRepository } from "@nestjs/typeorm";
import { ImportHistoryEntity } from "./files-imported.entity.js";
import { Repository } from "typeorm";

@Injectable()
export class TypeOrmImportHistoryRepository implements ImportHistoryRepository {
    constructor(
        @InjectRepository(ImportHistoryEntity)
        private readonly repository: Repository<ImportHistoryEntity>
    ) { }
    async create(createImportHistoryDTO: CreateImportHistoryDTO): Promise<{ id: string }> {
        const importHistory = await this.repository.create(createImportHistoryDTO)
        await this.repository.save(importHistory);

        return { id: importHistory.id };
    }
    async updateByImportID(importID: string, data: IUpdateImportHistory): Promise<void> {
        await this.repository.update({ import_id: importID }, data);
    }



}
