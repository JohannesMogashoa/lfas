export type DebitOrCredit = "Debit" | "Credit";

export const Bank = {
    INVESTEC: "investec",
    ABSA: "absa",
    FNB: "fnb",
    CAPITEC: "capitec",
    STANDARD_BANK: "standard_bank",
    NEDBANK: "nedbank",
} as const;

export type Bank = (typeof Bank)[keyof typeof Bank];

export type BankParserImplementationStatus = "implemented" | "placeholder";

export type BankDetectionCertainty = "high" | "medium" | "none";

export type DetectedBankResult = {
    readonly status: "detected";
    readonly bank: Bank;
    readonly certainty: Exclude<BankDetectionCertainty, "none">;
    readonly implementationStatus: BankParserImplementationStatus;
    readonly matchedSignals: readonly string[];
};

export type UnknownBankResult = {
    readonly status: "unknown";
    readonly bank: null;
    readonly certainty: "none";
    readonly fallbackReason: string;
    readonly matchedSignals: readonly [];
};

export type BankDetectionResult = DetectedBankResult | UnknownBankResult;

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

export type DetectedBankStatementParseResult = BankStatementParseResult & {
    readonly detection: BankDetectionResult;
};
