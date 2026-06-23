import type { CurrencyCode } from "@lfas/domain";

import type { NormalizedStatementTransaction } from "./types.ts";

export type ValidationSeverity = "pass" | "warning" | "failure";

export type ValidationCode =
    | "balance.opening.missing"
    | "balance.opening.valid"
    | "balance.opening.mismatch"
    | "balance.closing.missing"
    | "balance.closing.valid"
    | "balance.closing.mismatch"
    | "balance.running.missing"
    | "balance.running.valid"
    | "balance.running.mismatch"
    | "duplicate.exact.detected"
    | "duplicate.exact.none"
    | "gap.statement.empty"
    | "gap.date.detected"
    | "gap.date.none"
    | "gap.line.detected"
    | "gap.line.none"
    | "gap.period.boundary";

export type ValidationFinding = {
    readonly code: ValidationCode;
    readonly severity: ValidationSeverity;
    readonly count: number;
    readonly sourceLineNumbers?: readonly number[];
    readonly dates?: readonly string[];
    readonly amountDeltaMinor?: number;
    readonly currency?: CurrencyCode;
};

export type ValidationReportSummary = {
    readonly findingCount: number;
    readonly warningCount: number;
    readonly failureCount: number;
    readonly transactionCount: number;
};

export type ValidationReport = {
    readonly outcome: ValidationSeverity;
    readonly summary: ValidationReportSummary;
    readonly findings: readonly ValidationFinding[];
};

export type StatementValidationInput = {
    readonly transactions: readonly NormalizedStatementTransaction[];
    readonly openingBalanceMinor?: number;
    readonly closingBalanceMinor?: number;
    readonly currency?: CurrencyCode;
    readonly period?: {
        readonly startDate: string;
        readonly endDate: string;
    };
    readonly sourceLineCount?: number;
    readonly dateGapWarningDays?: number;
};

const defaultDateGapWarningDays = 7;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function createValidationReport(
    transactions: readonly NormalizedStatementTransaction[],
    findings: readonly ValidationFinding[]
): ValidationReport {
    const warningCount = findings.filter(
        (finding) => finding.severity === "warning"
    ).length;
    const failureCount = findings.filter(
        (finding) => finding.severity === "failure"
    ).length;

    return Object.freeze({
        findings: Object.freeze([...findings]),
        outcome:
            failureCount > 0
                ? "failure"
                : warningCount > 0
                  ? "warning"
                  : "pass",
        summary: Object.freeze({
            failureCount,
            findingCount: findings.length,
            transactionCount: transactions.length,
            warningCount,
        }),
    });
}

export function validateStatement(
    input: StatementValidationInput
): ValidationReport {
    const transactions = [...input.transactions];
    const findings = [
        ...validateBoundaryBalances(input),
        ...validateRunningBalances(transactions),
        ...detectDuplicateTransactions(transactions),
        ...detectTransactionGaps(input),
    ];

    return createValidationReport(transactions, findings);
}

export function validateBoundaryBalances(
    input: StatementValidationInput
): readonly ValidationFinding[] {
    const chronologicalTransactions = sortChronologically(input.transactions);
    const currency = input.currency ?? chronologicalTransactions[0]?.currency;

    return [
        validateOpeningBalance(
            chronologicalTransactions[0],
            input.openingBalanceMinor,
            currency
        ),
        validateClosingBalance(
            chronologicalTransactions.at(-1),
            input.closingBalanceMinor,
            currency
        ),
    ];
}

export function validateRunningBalances(
    transactions: readonly NormalizedStatementTransaction[]
): readonly ValidationFinding[] {
    if (transactions.length < 2) {
        return [
            {
                code: "balance.running.valid",
                count: 0,
                severity: "pass",
            },
        ];
    }

    const missingBalanceLines = transactions
        .filter((transaction) => transaction.balanceMinor === undefined)
        .map((transaction) => transaction.sourceLineNumber);

    if (missingBalanceLines.length > 0) {
        return [
            {
                code: "balance.running.missing",
                count: missingBalanceLines.length,
                severity: "warning",
                sourceLineNumbers: missingBalanceLines,
            },
        ];
    }

    const orderedTransactions = isDescendingStatementOrder(transactions)
        ? [...transactions].reverse()
        : [...transactions];
    const mismatches: ValidationFinding[] = [];

    for (let index = 1; index < orderedTransactions.length; index += 1) {
        const previous = orderedTransactions.at(index - 1);
        const current = orderedTransactions.at(index);

        if (previous === undefined || current === undefined) {
            continue;
        }

        const expectedBalance = applySignedAmount(
            previous.balanceMinor ?? 0,
            current
        );
        const actualBalance = current.balanceMinor ?? 0;

        if (actualBalance !== expectedBalance) {
            mismatches.push({
                amountDeltaMinor: actualBalance - expectedBalance,
                code: "balance.running.mismatch",
                count: 1,
                currency: current.currency,
                severity: "failure",
                sourceLineNumbers: [current.sourceLineNumber],
            });
        }
    }

    if (mismatches.length > 0) {
        return mismatches;
    }

    return [
        {
            code: "balance.running.valid",
            count: transactions.length - 1,
            severity: "pass",
        },
    ];
}

export function detectDuplicateTransactions(
    transactions: readonly NormalizedStatementTransaction[]
): readonly ValidationFinding[] {
    const fingerprints = new Map<string, number[]>();

    for (const transaction of transactions) {
        const fingerprint = createDuplicateTransactionFingerprint(transaction);
        const sourceLineNumbers = fingerprints.get(fingerprint) ?? [];
        sourceLineNumbers.push(transaction.sourceLineNumber);
        fingerprints.set(fingerprint, sourceLineNumbers);
    }

    const duplicateLineNumbers = [...fingerprints.values()]
        .filter((sourceLineNumbers) => sourceLineNumbers.length > 1)
        .flat();

    if (duplicateLineNumbers.length === 0) {
        return [
            {
                code: "duplicate.exact.none",
                count: 0,
                severity: "pass",
            },
        ];
    }

    return [
        {
            code: "duplicate.exact.detected",
            count: duplicateLineNumbers.length,
            severity: "failure",
            sourceLineNumbers: duplicateLineNumbers,
        },
    ];
}

export function detectTransactionGaps(
    input: StatementValidationInput
): readonly ValidationFinding[] {
    const transactions = sortChronologically(input.transactions);

    if (transactions.length === 0) {
        return [
            {
                code: "gap.statement.empty",
                count: 1,
                severity: "warning",
            },
        ];
    }

    return [
        detectDateGaps(transactions, input.dateGapWarningDays),
        detectSourceLineGaps(transactions, input.sourceLineCount),
        ...detectPeriodBoundaryGaps(transactions, input.period),
    ];
}

export function createDuplicateTransactionFingerprint(
    transaction: NormalizedStatementTransaction
) {
    return [
        transaction.bank,
        transaction.date,
        transaction.direction,
        transaction.amountMinor,
        transaction.balanceMinor ?? "no-balance",
        transaction.currency,
    ].join("|");
}

function validateOpeningBalance(
    firstTransaction: NormalizedStatementTransaction | undefined,
    openingBalanceMinor: number | undefined,
    currency: CurrencyCode | undefined
): ValidationFinding {
    if (openingBalanceMinor === undefined) {
        return {
            code: "balance.opening.missing",
            count: 1,
            severity: "warning",
        };
    }

    if (firstTransaction?.balanceMinor === undefined) {
        return {
            code: "balance.opening.missing",
            count: 1,
            currency,
            severity: "warning",
        };
    }

    const expectedFirstBalance = applySignedAmount(
        openingBalanceMinor,
        firstTransaction
    );
    const delta = firstTransaction.balanceMinor - expectedFirstBalance;

    if (delta !== 0) {
        return {
            amountDeltaMinor: delta,
            code: "balance.opening.mismatch",
            count: 1,
            currency: firstTransaction.currency,
            severity: "failure",
            sourceLineNumbers: [firstTransaction.sourceLineNumber],
        };
    }

    return {
        code: "balance.opening.valid",
        count: 1,
        currency: firstTransaction.currency,
        severity: "pass",
        sourceLineNumbers: [firstTransaction.sourceLineNumber],
    };
}

function validateClosingBalance(
    lastTransaction: NormalizedStatementTransaction | undefined,
    closingBalanceMinor: number | undefined,
    currency: CurrencyCode | undefined
): ValidationFinding {
    if (closingBalanceMinor === undefined) {
        return {
            code: "balance.closing.missing",
            count: 1,
            severity: "warning",
        };
    }

    if (lastTransaction?.balanceMinor === undefined) {
        return {
            code: "balance.closing.missing",
            count: 1,
            currency,
            severity: "warning",
        };
    }

    const delta = lastTransaction.balanceMinor - closingBalanceMinor;

    if (delta !== 0) {
        return {
            amountDeltaMinor: delta,
            code: "balance.closing.mismatch",
            count: 1,
            currency: lastTransaction.currency,
            severity: "failure",
            sourceLineNumbers: [lastTransaction.sourceLineNumber],
        };
    }

    return {
        code: "balance.closing.valid",
        count: 1,
        currency: lastTransaction.currency,
        severity: "pass",
        sourceLineNumbers: [lastTransaction.sourceLineNumber],
    };
}

function detectDateGaps(
    transactions: readonly NormalizedStatementTransaction[],
    dateGapWarningDays = defaultDateGapWarningDays
): ValidationFinding {
    const gapDates: string[] = [];

    for (let index = 1; index < transactions.length; index += 1) {
        const previous = transactions.at(index - 1);
        const current = transactions.at(index);

        if (previous === undefined || current === undefined) {
            continue;
        }

        const gapDays = daysBetween(previous.date, current.date);

        if (gapDays > dateGapWarningDays) {
            gapDates.push(previous.date, current.date);
        }
    }

    if (gapDates.length === 0) {
        return {
            code: "gap.date.none",
            count: 0,
            severity: "pass",
        };
    }

    return {
        code: "gap.date.detected",
        count: gapDates.length / 2,
        dates: gapDates,
        severity: "warning",
    };
}

function detectSourceLineGaps(
    transactions: readonly NormalizedStatementTransaction[],
    sourceLineCount: number | undefined
): ValidationFinding {
    const sourceLineNumbers = [
        ...new Set(
            transactions.map((transaction) => transaction.sourceLineNumber)
        ),
    ].sort((left, right) => left - right);
    const gapLines: number[] = [];

    for (let index = 1; index < sourceLineNumbers.length; index += 1) {
        const previous = sourceLineNumbers.at(index - 1);
        const current = sourceLineNumbers.at(index);

        if (previous === undefined || current === undefined) {
            continue;
        }

        if (current - previous > 1) {
            gapLines.push(previous, current);
        }
    }

    const lastSourceLineNumber = sourceLineNumbers.at(-1);

    if (
        sourceLineCount !== undefined &&
        lastSourceLineNumber !== undefined &&
        lastSourceLineNumber !== sourceLineCount
    ) {
        gapLines.push(lastSourceLineNumber, sourceLineCount);
    }

    if (gapLines.length === 0) {
        return {
            code: "gap.line.none",
            count: 0,
            severity: "pass",
        };
    }

    return {
        code: "gap.line.detected",
        count: gapLines.length / 2,
        severity: "warning",
        sourceLineNumbers: gapLines,
    };
}

function detectPeriodBoundaryGaps(
    transactions: readonly NormalizedStatementTransaction[],
    period: StatementValidationInput["period"]
): readonly ValidationFinding[] {
    if (period === undefined) {
        return [];
    }

    const firstTransaction = transactions[0];
    const lastTransaction = transactions.at(-1);
    const missingBoundaryDates: string[] = [];

    if (
        firstTransaction !== undefined &&
        firstTransaction.date > period.startDate
    ) {
        missingBoundaryDates.push(period.startDate, firstTransaction.date);
    }

    if (
        lastTransaction !== undefined &&
        lastTransaction.date < period.endDate
    ) {
        missingBoundaryDates.push(lastTransaction.date, period.endDate);
    }

    if (missingBoundaryDates.length === 0) {
        return [];
    }

    return [
        {
            code: "gap.period.boundary",
            count: missingBoundaryDates.length / 2,
            dates: missingBoundaryDates,
            severity: "warning",
        },
    ];
}

function applySignedAmount(
    balanceMinor: number,
    transaction: NormalizedStatementTransaction
) {
    return transaction.direction === "credit"
        ? balanceMinor + transaction.amountMinor
        : balanceMinor - transaction.amountMinor;
}

function isDescendingStatementOrder(
    transactions: readonly NormalizedStatementTransaction[]
) {
    const first = transactions[0];
    const last = transactions.at(-1);

    if (first === undefined || last === undefined) {
        return false;
    }

    if (first.date !== last.date) {
        return first.date > last.date;
    }

    return first.sourceLineNumber > last.sourceLineNumber;
}

function sortChronologically(
    transactions: readonly NormalizedStatementTransaction[]
) {
    return [...transactions].sort((left, right) => {
        if (left.date === right.date) {
            return left.sourceLineNumber - right.sourceLineNumber;
        }

        return left.date.localeCompare(right.date);
    });
}

function daysBetween(startDate: string, endDate: string) {
    const start = Date.parse(`${startDate}T00:00:00.000Z`);
    const end = Date.parse(`${endDate}T00:00:00.000Z`);

    return Math.floor((end - start) / millisecondsPerDay);
}
