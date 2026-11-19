
export abstract class TransactionImportQueue {
    abstract enqueue(importID: string, bank: string, extension: string, userID: string): Promise<void>
}
