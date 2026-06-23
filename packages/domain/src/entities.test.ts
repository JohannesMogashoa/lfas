import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    createAccount,
    createCanonicalTransaction,
    createMerchant,
    createMoney,
    createStatement,
} from "./index.ts";
import type { Money } from "./index.ts";

describe("canonical financial entities", () => {
    it("creates sanitized account and merchant entities", () => {
        assert.deepEqual(
            createAccount({
                accountType: "cheque",
                bank: "investec",
                displayName: "Primary cheque account",
                id: "account-1",
                maskedIdentifier: "**** 1234",
            }),
            {
                accountType: "cheque",
                bank: "investec",
                displayName: "Primary cheque account",
                id: "account-1",
                maskedIdentifier: "**** 1234",
            }
        );

        assert.deepEqual(
            createMerchant({
                displayName: "Safe Merchant",
                id: "merchant-1",
                normalizedName: "safe merchant",
            }),
            {
                displayName: "Safe Merchant",
                id: "merchant-1",
                normalizedName: "safe merchant",
            }
        );
    });

    it("rejects account identifiers that are not masked", () => {
        assert.throws(
            () =>
                createAccount({
                    displayName: "Primary cheque account",
                    id: "account-1",
                    maskedIdentifier: "raw-account-alpha",
                }),
            /raw PII/
        );
    });

    it("creates canonical transactions with explicit direction and money", () => {
        const transaction = createCanonicalTransaction({
            amount: createMoney(12345),
            date: "2025-03-11",
            description: "SAFE MERCHANT",
            direction: "debit",
            id: "transaction-1",
            runningBalance: createMoney(50000),
            sourceLineNumber: 4,
        });

        assert.equal(transaction.id, "transaction-1");
        assert.equal(transaction.direction, "debit");
        assert.equal(transaction.amount.amountMinor, 12345);
        assert.equal(Object.isFrozen(transaction), true);
    });

    it("rejects invalid transaction invariants", () => {
        assert.throws(
            () =>
                createCanonicalTransaction({
                    amount: createMoney(12345),
                    date: "11/03/2025",
                    description: "SAFE MERCHANT",
                    direction: "debit",
                    id: "transaction-1",
                }),
            /YYYY-MM-DD/
        );

        assert.throws(
            () =>
                createCanonicalTransaction({
                    amount: createMoney(12345),
                    date: "2025-03-11",
                    description: " ",
                    direction: "debit",
                    id: "transaction-1",
                }),
            /description/
        );
    });

    it("rejects transaction money with mixed currencies", () => {
        const usd = {
            amountMinor: 50000,
            currency: "USD",
        } as unknown as Money;

        assert.throws(
            () =>
                createCanonicalTransaction({
                    amount: createMoney(12345),
                    date: "2025-03-11",
                    description: "SAFE MERCHANT",
                    direction: "debit",
                    id: "transaction-1",
                    runningBalance: usd,
                }),
            /currencies must match/
        );
    });

    it("creates a statement aggregate with canonical transactions", () => {
        const transaction = createCanonicalTransaction({
            amount: createMoney(12345),
            date: "2025-03-11",
            description: "SAFE MERCHANT",
            direction: "debit",
            id: "transaction-1",
        });
        const statement = createStatement({
            bank: "investec",
            id: "statement-1",
            period: {
                endDate: "2025-03-31",
                startDate: "2025-03-01",
            },
            transactions: [transaction],
        });

        assert.equal(statement.transactions.length, 1);
        assert.equal(Object.isFrozen(statement.transactions), true);
    });

    it("rejects duplicate transaction identities in a statement", () => {
        const transaction = createCanonicalTransaction({
            amount: createMoney(12345),
            date: "2025-03-11",
            description: "SAFE MERCHANT",
            direction: "debit",
            id: "transaction-1",
        });

        assert.throws(
            () =>
                createStatement({
                    id: "statement-1",
                    transactions: [transaction, transaction],
                }),
            /Duplicate transaction id/
        );
    });
});
