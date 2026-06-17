export type DebitOrCredit = "Debit" | "Credit";

export const Bank = {
    INVESTEC: "investec",
    ABSA: "absa",
    FNB: "fnb",
    CAPITEC: "capitec",
} as const;

export type Bank = (typeof Bank)[keyof typeof Bank];

export type BankTransaction = {
    readonly date: string;
    readonly transactionDescription: string;
    readonly amount: string;
    readonly debitOrCredit: DebitOrCredit;
    readonly balance?: string;
};

export type BankStatementParseResult = {
    readonly transactions: BankTransaction[];
    readonly warnings: string[];
};
