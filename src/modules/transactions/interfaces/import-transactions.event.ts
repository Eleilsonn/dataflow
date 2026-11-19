import { Observable } from "rxjs";
export interface IDataPublish {
    importID: string;
    status: string;
    progress_percent: number;
    countSaved: number;
    countDuplicate: number;
    userID: string;
    startAt?: Date;
    finishAt?: Date;
}
export abstract class ImportTransactionsEvent {
    abstract publish(jobId: string, data: IDataPublish): void;
    abstract subscribe(jobId: string): Observable<MessageEvent>
}
