import { filter, Observable, Subject, map } from "rxjs";
import { IDataPublish, ImportTransactionsEvent } from "../../interfaces/import-transactions.event.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ImportTransactionsService implements ImportTransactionsEvent {
    private readonly events = new Subject<{ jobId: string, data: IDataPublish }>();

    publish(jobId: string, data: IDataPublish): void {
        this.events.next({ jobId, data });
    }

    subscribe(jobId: string): Observable<MessageEvent> {
        console.log(jobId)
        return this.events.pipe(
            filter(event => event.jobId === jobId),
            map(event => {
                delete (event.data as Partial<IDataPublish>).userID
                return new MessageEvent('message', { data: event.data })
            })
        )
    }

}
