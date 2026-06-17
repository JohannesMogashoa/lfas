import type { BankStatementParseResult } from "../types";
import { createUnsupportedBankParseResult } from "./common.ts";

export default async function parseAbsaStatement(
    bytes: ArrayBuffer
): Promise<BankStatementParseResult> {
    void bytes;

    return createUnsupportedBankParseResult("ABSA");
}
