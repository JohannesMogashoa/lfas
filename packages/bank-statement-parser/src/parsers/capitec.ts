import type { BankStatementParseResult } from "../types";
import { createUnsupportedBankParseResult } from "./common.ts";

export default async function parseCapitecStatement(
    bytes: ArrayBuffer
): Promise<BankStatementParseResult> {
    void bytes;

    return createUnsupportedBankParseResult("Capitec");
}
