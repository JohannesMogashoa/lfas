import type { Money } from "./money.ts";

export type BankCode =
    | "investec"
    | "absa"
    | "fnb"
    | "capitec"
    | "standard_bank"
    | "nedbank";

export type TransactionDirection = "debit" | "credit";

export type Account = {
    readonly id: string;
    readonly displayName: string;
    readonly bank?: BankCode;
    readonly accountType?: string;
    readonly maskedIdentifier?: string;
};

export type Merchant = {
    readonly id: string;
    readonly displayName: string;
    readonly normalizedName: string;
};

export type CanonicalTransaction = {
    readonly id: string;
    readonly date: string;
    readonly description: string;
    readonly direction: TransactionDirection;
    readonly amount: Money;
    readonly runningBalance?: Money;
    readonly accountId?: string;
    readonly merchantId?: string;
    readonly sourceLineNumber?: number;
};

export type Statement = {
    readonly id: string;
    readonly bank?: BankCode;
    readonly account?: Account;
    readonly transactions: readonly CanonicalTransaction[];
    readonly period?: {
        readonly startDate: string;
        readonly endDate: string;
    };
    readonly metadata?: {
        readonly sourceLineCount?: number;
        readonly warningCount?: number;
    };
};

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const maskedIdentifierPattern = /^[*\d\s-]+$/;

export function createAccount(args: Account): Account {
    assertNonEmpty(args.id, "Account id");
    assertNonEmpty(args.displayName, "Account display name");

    if (
        args.maskedIdentifier !== undefined &&
        !maskedIdentifierPattern.test(args.maskedIdentifier)
    ) {
        throw new Error("Account masked identifier must not contain raw PII");
    }

    return Object.freeze({ ...args });
}

export function createMerchant(args: Merchant): Merchant {
    assertNonEmpty(args.id, "Merchant id");
    assertNonEmpty(args.displayName, "Merchant display name");
    assertNonEmpty(args.normalizedName, "Merchant normalized name");

    return Object.freeze({ ...args });
}

export function createCanonicalTransaction(
    args: CanonicalTransaction
): CanonicalTransaction {
    assertNonEmpty(args.id, "Transaction id");
    assertDateOnly(args.date, "Transaction date");
    assertNonEmpty(args.description, "Transaction description");
    assertTransactionDirection(args.direction);
    assertMoneyCurrencyMatch(args.amount, args.runningBalance);

    if (
        args.sourceLineNumber !== undefined &&
        (!Number.isSafeInteger(args.sourceLineNumber) ||
            args.sourceLineNumber < 1)
    ) {
        throw new Error("Transaction source line number must be positive");
    }

    return Object.freeze({ ...args });
}

export function createStatement(args: Statement): Statement {
    assertNonEmpty(args.id, "Statement id");

    if (args.period !== undefined) {
        assertDateOnly(args.period.startDate, "Statement period start date");
        assertDateOnly(args.period.endDate, "Statement period end date");

        if (args.period.startDate > args.period.endDate) {
            throw new Error(
                "Statement period start date must be before end date"
            );
        }
    }

    const transactionIds = new Set<string>();

    for (const transaction of args.transactions) {
        if (transactionIds.has(transaction.id)) {
            throw new Error(`Duplicate transaction id: ${transaction.id}`);
        }

        transactionIds.add(transaction.id);
    }

    return Object.freeze({
        ...args,
        transactions: Object.freeze([...args.transactions]),
    });
}

function assertNonEmpty(value: string, label: string) {
    if (value.trim() === "") {
        throw new Error(`${label} is required`);
    }
}

function assertDateOnly(value: string, label: string) {
    if (!dateOnlyPattern.test(value)) {
        throw new Error(`${label} must use YYYY-MM-DD format`);
    }
}

function assertTransactionDirection(value: TransactionDirection) {
    if (value !== "debit" && value !== "credit") {
        throw new Error("Transaction direction must be debit or credit");
    }
}

function assertMoneyCurrencyMatch(left: Money, right?: Money) {
    if (right !== undefined && left.currency !== right.currency) {
        throw new Error(
            "Transaction amount and running balance currencies must match"
        );
    }
}
