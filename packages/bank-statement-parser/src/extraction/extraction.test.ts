import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    extractDescriptionAndReference,
    extractTransactionAmount,
    extractTransactionBalance,
    extractTransactionDate,
    parseGenericTableRow,
} from "./index.ts";

describe("transaction date extraction", () => {
    it("normalizes supported date formats", () => {
        assert.equal(
            extractTransactionDate("paid on 2025-03-11")?.isoDate,
            "2025-03-11"
        );
        assert.equal(
            extractTransactionDate("paid on 2025/03/11")?.isoDate,
            "2025-03-11"
        );
        assert.equal(
            extractTransactionDate("11/3/2025 merchant")?.isoDate,
            "2025-03-11"
        );
        assert.equal(
            extractTransactionDate("11 Mar 2025 merchant")?.isoDate,
            "2025-03-11"
        );
        assert.equal(
            extractTransactionDate("11 February 2025 merchant")?.isoDate,
            "2025-02-11"
        );
    });

    it("fails safely for unsupported or invalid dates", () => {
        assert.equal(extractTransactionDate("11/03/25 merchant"), null);
        assert.equal(extractTransactionDate("31 February 2025 merchant"), null);
        assert.equal(extractTransactionDate("not a transaction date"), null);
    });
});

describe("transaction money extraction", () => {
    it("normalizes supported amount formats into canonical money", () => {
        const amount = extractTransactionAmount(
            "Synthetic Merchant R 1,234.50"
        );

        assert.equal(amount?.normalizedText, "1234.50");
        assert.deepEqual(amount?.money, {
            amountMinor: 123450,
            currency: "ZAR",
        });

        assert.equal(
            extractTransactionAmount("Synthetic Merchant 1 234,50")
                ?.normalizedText,
            "1234.50"
        );
        assert.equal(
            extractTransactionAmount("Synthetic Merchant (99.90)")
                ?.normalizedText,
            "-99.90"
        );
        assert.equal(
            extractTransactionAmount("Synthetic Merchant 99.90-")
                ?.normalizedText,
            "-99.90"
        );
    });

    it("separates trailing amount and running balance", () => {
        const row = "Synthetic Merchant 214.90 65,590.18-";

        assert.equal(extractTransactionAmount(row)?.normalizedText, "214.90");
        assert.equal(
            extractTransactionBalance(row)?.normalizedText,
            "-65590.18"
        );
    });

    it("ignores decorative fee markers before the actual amount", () => {
        const row = "Synthetic Hosting 1.90 ~ 95.00";

        assert.equal(extractTransactionAmount(row)?.normalizedText, "95.00");
        assert.equal(extractTransactionBalance(row), null);
    });

    it("rejects unsupported precision", () => {
        assert.throws(
            () => extractTransactionAmount("Synthetic Merchant 10.999"),
            /Invalid decimal/
        );
    });
});

describe("description and reference extraction", () => {
    it("removes known spans and keeps meaningful description text", () => {
        const description = extractDescriptionAndReference(
            "2025-03-11 Synthetic Merchant REF ABC-123 95.00",
            [
                { end: 10, start: 0 },
                { end: 47, start: 42 },
            ]
        );

        assert.deepEqual(description, {
            description: "Synthetic Merchant",
            reference: "ABC-123",
        });
    });

    it("returns null when spans remove all useful text", () => {
        assert.equal(
            extractDescriptionAndReference("95.00", [{ end: 5, start: 0 }]),
            null
        );
    });
});

describe("generic table row parser", () => {
    it("parses a table-like row with primary date, secondary date, amount, and balance", () => {
        const row = parseGenericTableRow(
            "11Feb2025 8Feb2025 SYNTHETICMERCHANT 214.90 65,590.18-"
        );

        assert.equal(row?.date.isoDate, "2025-02-11");
        assert.equal(row?.secondaryDate?.isoDate, "2025-02-08");
        assert.equal(row?.description, "SYNTHETICMERCHANT");
        assert.equal(row?.amount.normalizedText, "214.90");
        assert.equal(row?.balance?.normalizedText, "-65590.18");
        assert.equal(row?.debitOrCredit, "Debit");
    });

    it("parses reference-heavy rows deterministically", () => {
        const row = parseGenericTableRow(
            "2025/03/11 Synthetic Merchant Reference ABC123 -10.00"
        );

        assert.equal(row?.description, "Synthetic Merchant");
        assert.equal(row?.reference, "ABC123");
        assert.equal(row?.debitOrCredit, "Credit");
    });

    it("fails safely for rows without a leading date or amount", () => {
        assert.equal(parseGenericTableRow("Synthetic Merchant 10.00"), null);
        assert.equal(
            parseGenericTableRow("2025-03-11 Synthetic Merchant"),
            null
        );
    });
});
