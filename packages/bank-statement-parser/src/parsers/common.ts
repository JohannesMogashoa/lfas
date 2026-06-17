import type { BankStatementParseResult } from "../types";

export function createUnsupportedBankParseResult(
    bankName: string
): BankStatementParseResult {
    return {
        transactions: [],
        warnings: [`${bankName} statement parsing is not implemented yet.`],
    };
}
