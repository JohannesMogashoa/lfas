import type { Bank } from "@lfas/bank-statement-parser";
import type {
    CanonicalTransaction,
    CurrencyCode,
    Money,
    TransactionDirection,
} from "@lfas/domain";

import type { ProcessingEvent, ProcessingState } from "./states.ts";

export type ParserTransactionLike = {
    readonly date: string;
    readonly transactionDescription: string;
    readonly amount: string;
    readonly debitOrCredit: "Debit" | "Credit";
    readonly balance?: string;
};

export type NormalizedStatementTransaction = {
    readonly bank: Bank;
    readonly date: CanonicalTransaction["date"];
    readonly description: CanonicalTransaction["description"];
    readonly amountMinor: Money["amountMinor"];
    readonly balanceMinor?: Money["amountMinor"];
    readonly currency: CurrencyCode;
    readonly direction: TransactionDirection;
    readonly sourceLineNumber: number;
};

export type ProcessingEventRecord = {
    readonly eventType: ProcessingEvent;
    readonly fromState?: ProcessingState;
    readonly toState: ProcessingState;
    readonly safeDetails?: Record<string, string | number | boolean>;
};

export type StatementSubmissionMetadata = {
    readonly bankHint?: Bank;
    readonly byteSize: number;
    readonly mimeType: string;
    readonly originalFileName?: string;
};

export type ReportDescriptor = {
    readonly format: "json" | "pdf" | "xlsx";
    readonly checksum: string;
    readonly downloadName: string;
    readonly storageId?: string;
};
