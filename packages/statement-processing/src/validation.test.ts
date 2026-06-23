import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Bank } from "@lfas/bank-statement-parser";

import {
    createValidationReport,
    detectDuplicateTransactions,
    detectTransactionGaps,
    validateBoundaryBalances,
    validateRunningBalances,
    validateStatement,
} from "./index.ts";
import type { NormalizedStatementTransaction } from "./types.ts";

describe("statement validation reports", () => {
    it("summarizes an empty passing report", () => {
        const report = createValidationReport([], []);

        assert.equal(report.outcome, "pass");
        assert.deepEqual(report.summary, {
            failureCount: 0,
            findingCount: 0,
            transactionCount: 0,
            warningCount: 0,
        });
    });

    it("summarizes warning-only and mixed reports", () => {
        const warningOnly = createValidationReport(
            [],
            [{ code: "balance.opening.missing", count: 1, severity: "warning" }]
        );
        const mixed = createValidationReport(
            [],
            [
                {
                    code: "balance.opening.missing",
                    count: 1,
                    severity: "warning",
                },
                {
                    code: "balance.running.mismatch",
                    count: 1,
                    severity: "failure",
                },
            ]
        );

        assert.equal(warningOnly.outcome, "warning");
        assert.equal(mixed.outcome, "failure");
        assert.equal(mixed.summary.warningCount, 1);
        assert.equal(mixed.summary.failureCount, 1);
    });
});

describe("boundary balance validation", () => {
    it("passes matching opening and closing balances", () => {
        const findings = validateBoundaryBalances({
            closingBalanceMinor: 13000,
            openingBalanceMinor: 10000,
            transactions: [
                tx({
                    amountMinor: 1000,
                    balanceMinor: 9000,
                    direction: "debit",
                }),
                tx({
                    amountMinor: 4000,
                    balanceMinor: 13000,
                    direction: "credit",
                    sourceLineNumber: 2,
                }),
            ],
        });

        assert.equal(findings[0]?.code, "balance.opening.valid");
        assert.equal(findings[1]?.code, "balance.closing.valid");
    });

    it("warns when optional opening or closing balances are missing", () => {
        const findings = validateBoundaryBalances({
            transactions: [tx({ balanceMinor: 9000 })],
        });

        assert.deepEqual(
            findings.map((finding) => finding.code),
            ["balance.opening.missing", "balance.closing.missing"]
        );
        assert.equal(
            findings.every((finding) => finding.severity === "warning"),
            true
        );
    });

    it("fails mismatched opening and closing balances with safe deltas", () => {
        const findings = validateBoundaryBalances({
            closingBalanceMinor: 14000,
            openingBalanceMinor: 10000,
            transactions: [
                tx({
                    amountMinor: 1000,
                    balanceMinor: 9500,
                    direction: "debit",
                }),
                tx({
                    amountMinor: 4000,
                    balanceMinor: 13000,
                    direction: "credit",
                    sourceLineNumber: 2,
                }),
            ],
        });

        assert.equal(findings[0]?.code, "balance.opening.mismatch");
        assert.equal(findings[0]?.amountDeltaMinor, 500);
        assert.equal(findings[1]?.code, "balance.closing.mismatch");
        assert.equal(findings[1]?.amountDeltaMinor, -1000);
    });
});

describe("running balance validation", () => {
    it("passes debit and credit transitions in ascending order", () => {
        const findings = validateRunningBalances([
            tx({ amountMinor: 1000, balanceMinor: 9000, direction: "debit" }),
            tx({
                amountMinor: 4000,
                balanceMinor: 13000,
                direction: "credit",
                sourceLineNumber: 2,
            }),
        ]);

        assert.deepEqual(findings, [
            { code: "balance.running.valid", count: 1, severity: "pass" },
        ]);
    });

    it("passes debit and credit transitions in descending order", () => {
        const findings = validateRunningBalances([
            tx({
                amountMinor: 4000,
                balanceMinor: 13000,
                date: "2025-03-12",
                direction: "credit",
                sourceLineNumber: 2,
            }),
            tx({ amountMinor: 1000, balanceMinor: 9000, direction: "debit" }),
        ]);

        assert.equal(findings[0]?.code, "balance.running.valid");
    });

    it("warns when any running balance is missing", () => {
        const findings = validateRunningBalances([
            tx({ balanceMinor: 9000 }),
            tx({ balanceMinor: undefined, sourceLineNumber: 2 }),
        ]);

        assert.equal(findings[0]?.code, "balance.running.missing");
        assert.deepEqual(findings[0]?.sourceLineNumbers, [2]);
    });

    it("fails mismatched running balances with source line references", () => {
        const findings = validateRunningBalances([
            tx({ amountMinor: 1000, balanceMinor: 9000, direction: "debit" }),
            tx({
                amountMinor: 4000,
                balanceMinor: 12000,
                direction: "credit",
                sourceLineNumber: 2,
            }),
        ]);

        assert.equal(findings[0]?.code, "balance.running.mismatch");
        assert.equal(findings[0]?.amountDeltaMinor, -1000);
        assert.deepEqual(findings[0]?.sourceLineNumbers, [2]);
    });
});

describe("duplicate transaction validation", () => {
    it("detects exact duplicate normalized transaction fingerprints", () => {
        const findings = detectDuplicateTransactions([
            tx({ sourceLineNumber: 1 }),
            tx({ sourceLineNumber: 2 }),
        ]);

        assert.deepEqual(findings, [
            {
                code: "duplicate.exact.detected",
                count: 2,
                severity: "failure",
                sourceLineNumbers: [1, 2],
            },
        ]);
    });

    it("does not flag repeated amounts on distinct dates", () => {
        const findings = detectDuplicateTransactions([
            tx({ amountMinor: 1000, date: "2025-03-11", sourceLineNumber: 1 }),
            tx({ amountMinor: 1000, date: "2025-03-12", sourceLineNumber: 2 }),
        ]);

        assert.equal(findings[0]?.code, "duplicate.exact.none");
    });

    it("passes empty statements without duplicate findings", () => {
        const findings = detectDuplicateTransactions([]);

        assert.equal(findings[0]?.code, "duplicate.exact.none");
    });
});

describe("transaction gap validation", () => {
    it("passes one-transaction statements without date or line gaps", () => {
        const findings = detectTransactionGaps({ transactions: [tx({})] });

        assert.deepEqual(
            findings.map((finding) => finding.code),
            ["gap.date.none", "gap.line.none"]
        );
    });

    it("detects date gaps with unordered input", () => {
        const findings = detectTransactionGaps({
            dateGapWarningDays: 7,
            transactions: [
                tx({ date: "2025-03-20", sourceLineNumber: 2 }),
                tx({ date: "2025-03-01", sourceLineNumber: 1 }),
            ],
        });

        assert.equal(findings[0]?.code, "gap.date.detected");
        assert.deepEqual(findings[0]?.dates, ["2025-03-01", "2025-03-20"]);
    });

    it("detects source line gaps", () => {
        const findings = detectTransactionGaps({
            transactions: [
                tx({ sourceLineNumber: 1 }),
                tx({ sourceLineNumber: 4 }),
            ],
        });

        assert.equal(findings[1]?.code, "gap.line.detected");
        assert.deepEqual(findings[1]?.sourceLineNumbers, [1, 4]);
    });

    it("detects empty statements and period boundary gaps", () => {
        const emptyFindings = detectTransactionGaps({ transactions: [] });
        const boundaryFindings = detectTransactionGaps({
            period: { endDate: "2025-03-31", startDate: "2025-03-01" },
            transactions: [tx({ date: "2025-03-11" })],
        });

        assert.equal(emptyFindings[0]?.code, "gap.statement.empty");
        assert.equal(boundaryFindings.at(-1)?.code, "gap.period.boundary");
    });
});

describe("statement validation orchestration", () => {
    it("aggregates balance, duplicate, and gap findings", () => {
        const report = validateStatement({
            closingBalanceMinor: 9000,
            openingBalanceMinor: 10000,
            transactions: [
                tx({
                    amountMinor: 1000,
                    balanceMinor: 9000,
                    direction: "debit",
                }),
                tx({
                    amountMinor: 1000,
                    balanceMinor: 9000,
                    direction: "debit",
                    sourceLineNumber: 2,
                }),
            ],
        });

        assert.equal(report.outcome, "failure");
        assert.equal(
            report.findings.some(
                (finding) => finding.code === "duplicate.exact.detected"
            ),
            true
        );
        assert.equal(
            report.findings.every((finding) => !("description" in finding)),
            true
        );
    });
});

function tx(
    overrides: Partial<NormalizedStatementTransaction>
): NormalizedStatementTransaction {
    return {
        amountMinor: 1000,
        balanceMinor: 9000,
        bank: Bank.INVESTEC,
        currency: "ZAR",
        date: "2025-03-11",
        description: "SAFE DESCRIPTION",
        direction: "debit",
        sourceLineNumber: 1,
        ...overrides,
    };
}
