import parseAbsaStatement from "./parsers/absa.ts";
import parseCapitecStatement from "./parsers/capitec.ts";
import parseFnbStatement from "./parsers/fnb.ts";
import parseInvestecStatement from "./parsers/investec.ts";
import parseNedbankStatement from "./parsers/nedbank.ts";
import parseStandardBankStatement from "./parsers/standard-bank.ts";
import { Bank } from "./types.ts";
import type {
    Bank as BankId,
    BankParserImplementationStatus,
    BankStatementParseResult,
} from "./types.ts";

export type BankParser = (
    bytes: ArrayBuffer
) => Promise<BankStatementParseResult>;

export type BankDetectorSignal = {
    readonly id: string;
    readonly certainty: "high" | "medium";
    readonly pattern: RegExp;
};

export type BankRegistryEntry = {
    readonly bank: BankId;
    readonly displayName: string;
    readonly implementationStatus: BankParserImplementationStatus;
    readonly detectorSignals: readonly BankDetectorSignal[];
    readonly parser: BankParser;
};

export const bankRegistry = [
    {
        bank: Bank.INVESTEC,
        detectorSignals: [
            signal(
                "investec-specialist-bank-header",
                "high",
                /\binvestec specialist bank\b/u
            ),
            signal(
                "investec-private-bank-account-statement",
                "high",
                /\bprivate bank account statement\b/u
            ),
            signal(
                "investec-bank-limited-footer",
                "high",
                /\binvestec bank limited\b/u
            ),
            signal(
                "investec-branch-code-reference",
                "medium",
                /\binvestec branch code\b/u
            ),
        ],
        displayName: "Investec",
        implementationStatus: "implemented",
        parser: parseInvestecStatement,
    },
    {
        bank: Bank.ABSA,
        detectorSignals: [
            signal("absa-bank-name", "high", /\babsa\b/u),
            signal("absa-bank-limited", "high", /\babsa bank limited\b/u),
            signal("absa-statement-header", "medium", /\babsa .*statement\b/u),
        ],
        displayName: "ABSA",
        implementationStatus: "placeholder",
        parser: parseAbsaStatement,
    },
    {
        bank: Bank.FNB,
        detectorSignals: [
            signal("fnb-bank-name", "high", /\bfnb\b/u),
            signal(
                "fnb-first-national-bank",
                "high",
                /\bfirst national bank\b/u
            ),
            signal("fnb-statement-header", "medium", /\bfnb .*statement\b/u),
        ],
        displayName: "FNB",
        implementationStatus: "placeholder",
        parser: parseFnbStatement,
    },
    {
        bank: Bank.CAPITEC,
        detectorSignals: [
            signal("capitec-bank-name", "high", /\bcapitec\b/u),
            signal("capitec-bank-limited", "high", /\bcapitec bank limited\b/u),
            signal("capitec-global-one-account", "medium", /\bglobal one\b/u),
        ],
        displayName: "Capitec",
        implementationStatus: "placeholder",
        parser: parseCapitecStatement,
    },
    {
        bank: Bank.STANDARD_BANK,
        detectorSignals: [
            signal("standard-bank-name", "high", /\bstandard bank\b/u),
            signal(
                "standard-bank-of-south-africa",
                "high",
                /\bstandard bank of south africa\b/u
            ),
            signal(
                "standard-bank-statement-header",
                "medium",
                /\bstandard bank .*statement\b/u
            ),
        ],
        displayName: "Standard Bank",
        implementationStatus: "placeholder",
        parser: parseStandardBankStatement,
    },
    {
        bank: Bank.NEDBANK,
        detectorSignals: [
            signal("nedbank-bank-name", "high", /\bnedbank\b/u),
            signal("nedbank-limited", "high", /\bnedbank limited\b/u),
            signal(
                "nedbank-statement-header",
                "medium",
                /\bnedbank .*statement\b/u
            ),
        ],
        displayName: "Nedbank",
        implementationStatus: "placeholder",
        parser: parseNedbankStatement,
    },
] as const satisfies readonly BankRegistryEntry[];

export function getBankRegistryEntry(bank: BankId): BankRegistryEntry {
    const entry = bankRegistry.find((candidate) => candidate.bank === bank);

    if (!entry) {
        throw new Error(`Unsupported bank: ${bank}`);
    }

    return entry;
}

function signal(
    id: string,
    certainty: "high" | "medium",
    pattern: RegExp
): BankDetectorSignal {
    return { certainty, id, pattern };
}
