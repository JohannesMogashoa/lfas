import type { Bank } from "@lfas/bank-statement-parser";

import { parseDecimalAmountToMinorUnits } from "./money.ts";
import type {
    NormalizedStatementTransaction,
    ParserTransactionLike,
} from "./types.ts";

export function normalizeParsedTransactions(
    bank: Bank,
    transactions: readonly ParserTransactionLike[]
): NormalizedStatementTransaction[] {
    return transactions.map((transaction, index) => ({
        amountMinor: parseDecimalAmountToMinorUnits(transaction.amount),
        balanceMinor:
            transaction.balance === undefined
                ? undefined
                : parseDecimalAmountToMinorUnits(transaction.balance),
        bank,
        currency: "ZAR",
        date: transaction.date,
        description: transaction.transactionDescription,
        direction: transaction.debitOrCredit === "Debit" ? "debit" : "credit",
        sourceLineNumber: index + 1,
    }));
}
