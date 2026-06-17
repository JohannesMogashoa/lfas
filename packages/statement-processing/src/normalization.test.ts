import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Bank } from "@lfas/bank-statement-parser";

import { normalizeParsedTransactions } from "./index.ts";

describe("statement transaction normalization", () => {
    it("converts parsed Investec money into integer minor units", () => {
        const [transaction] = normalizeParsedTransactions(Bank.INVESTEC, [
            {
                amount: "1,234.50",
                balance: "12,345.67",
                date: "2025-03-11",
                debitOrCredit: "Debit",
                transactionDescription: "SAFE MERCHANT",
            },
        ]);

        assert.deepEqual(transaction, {
            amountMinor: 123450,
            balanceMinor: 1234567,
            bank: Bank.INVESTEC,
            currency: "ZAR",
            date: "2025-03-11",
            description: "SAFE MERCHANT",
            direction: "debit",
            sourceLineNumber: 1,
        });
    });
});
