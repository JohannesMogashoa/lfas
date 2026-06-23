import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Bank } from "@lfas/bank-statement-parser";

import {
    createRedactionToken,
    createSanitizedAiStatementContract,
    detectSensitiveContent,
    inspectPromptCandidate,
    redactSensitiveText,
} from "./index.ts";
import type { NormalizedStatementTransaction } from "./types.ts";

const secret = "local-redaction-secret";

describe("privacy detection", () => {
    it("detects banking identifiers without returning original values", () => {
        const result = detectSensitiveContent({
            chunks: [
                {
                    fieldName: "safeFixture",
                    lineNumber: 7,
                    text: "Account number 0000 0000 0123 and card 4000 0000 0000 0002",
                },
            ],
        });

        assert.deepEqual(
            result.findings.map((finding) => finding.type),
            ["account_number", "card_number"]
        );
        assert.equal(result.summary.accountNumberCount, 1);
        assert.equal(result.summary.cardNumberCount, 1);
        assert.equal(
            JSON.stringify(result).includes("4000 0000 0000 0002"),
            false
        );
        assert.deepEqual(result.findings[0]?.location, {
            chunkIndex: 0,
            endOffset: 29,
            fieldName: "safeFixture",
            lineNumber: 7,
            startOffset: 15,
        });
    });

    it("detects identity and contact details with safe metadata only", () => {
        const result = detectSensitiveContent({
            chunks: [
                {
                    text: "Identity number 990101 0000 000; email privacy@example.invalid; phone +27 00 000 0000",
                },
            ],
        });

        assert.deepEqual(
            result.findings.map((finding) => finding.type),
            ["identity_number", "email", "phone_number"]
        );
        assert.equal(result.summary.identityNumberCount, 1);
        assert.equal(result.summary.emailCount, 1);
        assert.equal(result.summary.phoneNumberCount, 1);
        assert.equal(
            JSON.stringify(result).includes("privacy@example.invalid"),
            false
        );
    });

    it("does not flag benign amounts, dates, or unlabeled reference numbers", () => {
        const result = detectSensitiveContent({
            chunks: [
                {
                    text: "Paid 1234.56 on 2025-03-11 with reference 1234567890",
                },
            ],
        });

        assert.equal(result.findings.length, 0);
        assert.equal(result.summary.findingCount, 0);
    });
});

describe("privacy masking and tokenization", () => {
    it("masks sensitive values and keeps raw values out of outputs", () => {
        const result = redactSensitiveText({
            secret,
            text: "Email privacy@example.invalid and account 0000 0000 0123",
        });

        assert.match(result.maskedText, /\[REDACTED:EMAIL:1\]/u);
        assert.match(result.maskedText, /\[REDACTED:ACCOUNT_NUMBER:2\]/u);
        assert.equal(
            result.maskedText.includes("privacy@example.invalid"),
            false
        );
        assert.equal(result.maskedText.includes("0000 0000 0123"), false);
        assert.equal(
            JSON.stringify(result.tokens).includes("0000 0000 0123"),
            false
        );
    });

    it("creates stable local tokens that change with the secret", () => {
        const first = createRedactionToken(
            "card_number",
            "4000 0000 0000 0002",
            secret
        );
        const second = createRedactionToken(
            "card_number",
            "4000000000000002",
            secret
        );
        const differentSecret = createRedactionToken(
            "card_number",
            "4000000000000002",
            "different-local-secret"
        );

        assert.equal(first, second);
        assert.notEqual(first, differentSecret);
        assert.equal(first.includes("4000"), false);
    });

    it("returns safe empty metadata for no-match input", () => {
        const result = redactSensitiveText({
            secret,
            text: "No sensitive content in this synthetic fixture.",
        });

        assert.equal(
            result.maskedText,
            "No sensitive content in this synthetic fixture."
        );
        assert.equal(result.findings.length, 0);
        assert.equal(result.tokens.length, 0);
    });
});

describe("sanitized AI contract", () => {
    it("projects only approved transaction fields and redaction metadata", () => {
        const redaction = redactSensitiveText({
            secret,
            text: "Account number 0000 0000 0123",
        });
        const contract = createSanitizedAiStatementContract({
            redaction,
            transactions: [
                tx({
                    description: "Account number 0000 0000 0123",
                }),
            ],
            validationSummary: {
                failureCount: 0,
                findingCount: 1,
                transactionCount: 1,
                warningCount: 1,
            },
        });

        assert.equal(contract.contractVersion, "statement-ai-input.v1");
        assert.deepEqual(contract.transactions, [
            {
                amountMinor: 1000,
                balanceMinor: 9000,
                currency: "ZAR",
                date: "2025-03-11",
                direction: "debit",
                sourceLineNumber: 1,
            },
        ]);
        assert.equal(JSON.stringify(contract).includes("description"), false);
        assert.equal(
            JSON.stringify(contract).includes("0000 0000 0123"),
            false
        );
        assert.equal(contract.redactionTokenCount, 1);
    });

    it("rejects explicit raw statement text fields at construction boundaries", () => {
        const redaction = redactSensitiveText({
            secret,
            text: "No sensitive content.",
        });

        assert.throws(
            () =>
                createSanitizedAiStatementContract({
                    rawStatementText: "synthetic raw fixture",
                    redaction,
                    transactions: [tx({})],
                    validationSummary: {
                        failureCount: 0,
                        findingCount: 0,
                        transactionCount: 1,
                        warningCount: 0,
                    },
                } as Parameters<typeof createSanitizedAiStatementContract>[0]),
            /Unsafe AI contract field/u
        );
    });
});

describe("prompt inspection", () => {
    it("approves sanitized contract-derived prompts without sensitive findings", () => {
        const result = inspectPromptCandidate({
            prompt: "Summarize 1 transaction, 0 failures, and 1 redaction event.",
            source: "sanitized_contract",
        });

        assert.deepEqual(result, {
            safeDetails: {
                findingCount: 0,
                source: "sanitized_contract",
            },
            status: "approved",
        });
    });

    it("blocks prompts that were not built from the sanitized AI contract", () => {
        const result = inspectPromptCandidate({
            prompt: "Summarize this text.",
            source: "raw_text",
        });

        assert.equal(result.status, "blocked");
        assert.equal(
            result.status === "blocked" ? result.failureCode : undefined,
            "prompt.not_sanitized_contract"
        );
    });

    it("blocks sensitive prompt candidates without returning the raw prompt", () => {
        const result = inspectPromptCandidate({
            prompt: "Email privacy@example.invalid about account 0000 0000 0123",
            source: "sanitized_contract",
        });

        assert.equal(result.status, "blocked");
        assert.equal(
            result.status === "blocked" ? result.failureCode : undefined,
            "prompt.contains_sensitive_content"
        );
        assert.equal(
            JSON.stringify(result).includes("privacy@example.invalid"),
            false
        );
        assert.deepEqual(
            result.status === "blocked" ? result.safeDetails.categories : [],
            ["email", "account_number"]
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
