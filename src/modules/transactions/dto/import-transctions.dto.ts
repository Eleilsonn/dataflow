import { IsNotEmpty } from "class-validator";

export class ImportTransctionsDTO {
    @IsNotEmpty({ message: 'Informe o banco a qual pertence as transações' })
    bank: string;
}
