import type { Bank } from "@lfas/bank-statement-parser";
import { createCanonicalTransaction, parseDecimalMoney } from "@lfas/domain";

import type {
    NormalizedStatementTransaction,
    ParserTransactionLike,
} from "./types.ts";

export function normalizeParsedTransactions(
    bank: Bank,
    transactions: readonly ParserTransactionLike[]
): NormalizedStatementTransaction[] {
    return transactions.map((transaction, index) => {
        const amount = parseDecimalMoney(transaction.amount);
        const runningBalance =
            transaction.balance === undefined
                ? undefined
                : parseDecimalMoney(transaction.balance);
        const canonicalTransaction = createCanonicalTransaction({
            amount,
            date: transaction.date,
            description: transaction.transactionDescription,
            direction:
                transaction.debitOrCredit === "Debit" ? "debit" : "credit",
            id: `${bank}-${index + 1}`,
            runningBalance,
            sourceLineNumber: index + 1,
        });

        return {
            amountMinor: canonicalTransaction.amount.amountMinor,
            balanceMinor: canonicalTransaction.runningBalance?.amountMinor,
            bank,
            currency: canonicalTransaction.amount.currency,
            date: canonicalTransaction.date,
            description: canonicalTransaction.description,
            direction: canonicalTransaction.direction,
            sourceLineNumber: index + 1,
        };
    });
}
