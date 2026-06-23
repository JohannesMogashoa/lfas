import { getBankRegistryEntry } from "./bank-registry.ts";
import type { BankStatementParseResult } from "./types.ts";
import type { Bank } from "./types.ts";

export type {
    BankDetectionCertainty,
    BankDetectionResult,
    BankParserImplementationStatus,
    BankStatementParseResult,
    BankTransaction,
    DebitOrCredit,
    DetectedBankResult,
    DetectedBankStatementParseResult,
    UnknownBankResult,
} from "./types.ts";
export { Bank } from "./types.ts";

export { default as parseAbsaStatement } from "./parsers/absa.ts";
export { default as parseCapitecStatement } from "./parsers/capitec.ts";
export { default as parseFnbStatement } from "./parsers/fnb.ts";
export { default as parseInvestecStatement } from "./parsers/investec.ts";
export { default as parseNedbankStatement } from "./parsers/nedbank.ts";
export { default as parseStandardBankStatement } from "./parsers/standard-bank.ts";
export { bankRegistry, getBankRegistryEntry } from "./bank-registry.ts";
export {
    extractDescriptionAndReference,
    extractTransactionAmount,
    extractTransactionBalance,
    extractTransactionDate,
    parseGenericTableRow,
} from "./extraction/index.ts";
export type {
    ExtractedDate,
    ExtractedDescription,
    ExtractedMoney,
    GenericTableRow,
    TextSpan,
} from "./extraction/index.ts";
export {
    detectBankFromTextLines,
    detectBankStatementPdf,
    parseDetectedBankStatementPdf,
} from "./detection.ts";
export { extractPdfTextLines } from "./pdf.ts";

export async function parseBankStatementPdf(
    bytes: ArrayBuffer,
    bank: Bank
): Promise<BankStatementParseResult> {
    return getBankRegistryEntry(bank).parser(bytes);
}
