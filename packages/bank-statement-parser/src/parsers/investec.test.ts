import assert from "node:assert/strict";
import test from "node:test";

import {
    parseInvestecTextLines,
    parseInvestecTransactionLine,
} from "./investec.ts";

test("parses Investec debit rows with action date, trans date, and running balance", () => {
    const transaction = parseInvestecTransactionLine(
        "11Feb2025 8Feb2025 THESHAWARMAGRILLPORTELIZABETZA 214.90 65,590.18-"
    );

    assert.deepEqual(transaction, {
        amount: "214.90",
        balance: "-65590.18",
        date: "2025-02-11",
        debitOrCredit: "Debit",
        transactionDescription: "THESHAWARMAGRILLPORTELIZABETZA",
    });
});

test("parses Investec rows that include a fee marker before the transaction amount", () => {
    const transaction = parseInvestecTransactionLine(
        "4Mar2025 WEBWAY*INV264212WEBWAY.HOSTUS 1.90 ~ 95.00"
    );

    assert.deepEqual(transaction, {
        amount: "95.00",
        balance: undefined,
        date: "2025-03-04",
        debitOrCredit: "Debit",
        transactionDescription: "WEBWAY*INV264212WEBWAY.HOSTUS",
    });
});

test("keeps wrapped Investec descriptions attached to the original transaction", () => {
    const transactions = parseInvestecTextLines([
        "1Mar2025 28Feb2025 GoogleYouTubePremiumLondonGB 71.99",
        "PremiumFamilyPlan",
        "2Mar2025 1Mar2025 NextTransaction 10.00",
    ]);

    assert.equal(transactions.length, 2);
    assert.equal(
        transactions[0]?.transactionDescription,
        "GoogleYouTubePremiumLondonGB PremiumFamilyPlan"
    );
    assert.equal(transactions[0]?.date, "2025-03-01");
    assert.equal(transactions[0]?.amount, "71.99");
    assert.equal(transactions[1]?.transactionDescription, "NextTransaction");
});
