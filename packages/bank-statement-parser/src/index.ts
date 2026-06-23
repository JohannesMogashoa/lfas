import parseAbsaStatement from "./parsers/absa.ts";
import parseCapitecStatement from "./parsers/capitec.ts";
import parseFnbStatement from "./parsers/fnb.ts";
import parseInvestecStatement from "./parsers/investec.ts";
import { Bank } from "./types.ts";
import type { BankStatementParseResult } from "./types.ts";

export type {
    BankStatementParseResult,
    BankTransaction,
    DebitOrCredit,
} from "./types.ts";
export { Bank } from "./types.ts";

export { default as parseAbsaStatement } from "./parsers/absa.ts";
export { default as parseCapitecStatement } from "./parsers/capitec.ts";
export { default as parseFnbStatement } from "./parsers/fnb.ts";
export { default as parseInvestecStatement } from "./parsers/investec.ts";
export { extractPdfTextLines } from "./pdf.ts";

export async function parseBankStatementPdf(
    bytes: ArrayBuffer,
    bank: Bank = Bank.INVESTEC
): Promise<BankStatementParseResult> {
    switch (bank) {
        case Bank.ABSA:
            return parseAbsaStatement(bytes);
        case Bank.CAPITEC:
            return parseCapitecStatement(bytes);
        case Bank.FNB:
            return parseFnbStatement(bytes);
        case Bank.INVESTEC:
            return parseInvestecStatement(bytes);
        default:
            return parseInvestecStatement(bytes);
    }
}
