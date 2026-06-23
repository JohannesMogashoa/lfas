import { bankRegistry, getBankRegistryEntry } from "./bank-registry.ts";
import { extractPdfTextLines } from "./pdf.ts";
import type {
    Bank,
    BankDetectionResult,
    DetectedBankStatementParseResult,
} from "./types.ts";

type CandidateMatch = {
    readonly bank: Bank;
    readonly highSignalCount: number;
    readonly implementationStatus: "implemented" | "placeholder";
    readonly matchedSignals: readonly string[];
    readonly score: number;
};

const UNKNOWN_NO_SIGNALS = "No supported bank detection signals were found.";
const UNKNOWN_CONFLICTING_SIGNALS =
    "Conflicting bank detection signals were found.";

export function detectBankFromTextLines(
    lines: readonly string[]
): BankDetectionResult {
    const normalizedLines = lines.map(normalizeLine).filter(Boolean);

    if (normalizedLines.length === 0) {
        return unknown(UNKNOWN_NO_SIGNALS);
    }

    const candidates = bankRegistry
        .map((entry): CandidateMatch => {
            const matchedSignals = entry.detectorSignals
                .filter((detectorSignal) =>
                    normalizedLines.some((line) =>
                        detectorSignal.pattern.test(line)
                    )
                )
                .map((detectorSignal) => detectorSignal.id);
            const highSignalCount = entry.detectorSignals.filter(
                (detectorSignal) =>
                    detectorSignal.certainty === "high" &&
                    matchedSignals.includes(detectorSignal.id)
            ).length;
            const score = entry.detectorSignals
                .filter((detectorSignal) =>
                    matchedSignals.includes(detectorSignal.id)
                )
                .reduce(
                    (total, detectorSignal) =>
                        total + (detectorSignal.certainty === "high" ? 2 : 1),
                    0
                );

            return {
                bank: entry.bank,
                highSignalCount,
                implementationStatus: entry.implementationStatus,
                matchedSignals,
                score,
            };
        })
        .filter((candidate) => candidate.score > 0)
        .sort((left, right) => right.score - left.score);

    const [best, secondBest] = candidates;

    if (!best) {
        return unknown(UNKNOWN_NO_SIGNALS);
    }

    if (secondBest && best.score === secondBest.score) {
        return unknown(UNKNOWN_CONFLICTING_SIGNALS);
    }

    if (best.highSignalCount === 0 && best.score < 2) {
        return unknown(UNKNOWN_NO_SIGNALS);
    }

    return {
        bank: best.bank,
        certainty: best.highSignalCount > 0 ? "high" : "medium",
        implementationStatus: best.implementationStatus,
        matchedSignals: best.matchedSignals,
        status: "detected",
    };
}

export async function detectBankStatementPdf(
    bytes: ArrayBuffer
): Promise<BankDetectionResult> {
    return detectBankFromTextLines(await extractPdfTextLines(bytes.slice(0)));
}

export async function parseDetectedBankStatementPdf(
    bytes: ArrayBuffer
): Promise<DetectedBankStatementParseResult> {
    const detection = await detectBankStatementPdf(bytes);

    if (detection.status === "unknown") {
        return {
            detection,
            transactions: [],
            warnings: [
                "Statement bank could not be identified from supported detection signals.",
            ],
        };
    }

    const entry = getBankRegistryEntry(detection.bank);
    const result = await entry.parser(bytes.slice(0));

    return {
        ...result,
        detection,
    };
}

function normalizeLine(line: string) {
    return line.toLowerCase().replace(/\s+/gu, " ").trim();
}

function unknown(fallbackReason: string): BankDetectionResult {
    return {
        bank: null,
        certainty: "none",
        fallbackReason,
        matchedSignals: [],
        status: "unknown",
    };
}
