import { createHmac } from "node:crypto";

import type { NormalizedStatementTransaction } from "./types.ts";
import type { ValidationReportSummary } from "./validation.ts";

export type PrivacyFindingType =
    | "account_number"
    | "card_number"
    | "identity_number"
    | "email"
    | "phone_number";

export type PrivacyFindingConfidence = "high" | "medium";

export type PrivacyTextChunk = {
    readonly text: string;
    readonly fieldName?: string;
    readonly lineNumber?: number;
};

export type PrivacyFindingLocation = {
    readonly chunkIndex: number;
    readonly startOffset: number;
    readonly endOffset: number;
    readonly fieldName?: string;
    readonly lineNumber?: number;
};

export type PrivacyFinding = {
    readonly type: PrivacyFindingType;
    readonly confidence: PrivacyFindingConfidence;
    readonly location: PrivacyFindingLocation;
    readonly length: number;
};

export type PrivacyDetectionInput = {
    readonly chunks: readonly PrivacyTextChunk[];
};

export type PrivacyDetectionResult = {
    readonly findings: readonly PrivacyFinding[];
    readonly summary: PrivacySummary;
};

export type PrivacySummary = {
    readonly findingCount: number;
    readonly accountNumberCount: number;
    readonly cardNumberCount: number;
    readonly identityNumberCount: number;
    readonly emailCount: number;
    readonly phoneNumberCount: number;
};

export type RedactionToken = {
    readonly type: PrivacyFindingType;
    readonly token: string;
    readonly location: PrivacyFindingLocation;
};

export type RedactionResult = {
    readonly maskedText: string;
    readonly findings: readonly PrivacyFinding[];
    readonly tokens: readonly RedactionToken[];
    readonly summary: PrivacySummary;
};

export type RedactionInput = {
    readonly text: string;
    readonly secret: string;
    readonly fieldName?: string;
    readonly lineNumber?: number;
};

export type SanitizedAiTransaction = Pick<
    NormalizedStatementTransaction,
    | "date"
    | "amountMinor"
    | "balanceMinor"
    | "currency"
    | "direction"
    | "sourceLineNumber"
>;

export type SanitizedAiStatementContract = {
    readonly contractVersion: "statement-ai-input.v1";
    readonly transactions: readonly SanitizedAiTransaction[];
    readonly validationSummary: ValidationReportSummary;
    readonly redactionSummary: PrivacySummary;
    readonly redactionTokenCount: number;
};

export type SanitizedAiStatementInput = {
    readonly transactions: readonly NormalizedStatementTransaction[];
    readonly validationSummary: ValidationReportSummary;
    readonly redaction: Pick<RedactionResult, "summary" | "tokens">;
};

export type PromptInspectionFailureCode =
    | "prompt.not_sanitized_contract"
    | "prompt.contains_sensitive_content";

export type PromptInspectionResult =
    | {
          readonly status: "approved";
          readonly safeDetails: {
              readonly source: "sanitized_contract";
              readonly findingCount: 0;
          };
      }
    | {
          readonly status: "blocked";
          readonly failureCode: PromptInspectionFailureCode;
          readonly safeDetails: {
              readonly source: PromptCandidateSource;
              readonly findingCount: number;
              readonly categories: readonly PrivacyFindingType[];
          };
      };

export type PromptCandidateSource = "sanitized_contract" | "raw_text";

export type PromptInspectionInput = {
    readonly prompt: string;
    readonly source: PromptCandidateSource;
};

type InternalPrivacyMatch = PrivacyFinding & {
    readonly value: string;
};

type LabeledDigitDetectorConfig = {
    readonly type: PrivacyFindingType;
    readonly labelPattern: RegExp;
    readonly minDigits: number;
    readonly maxDigits: number;
    readonly maxLookahead: number;
    readonly allowLeadingPlus: boolean;
    readonly allowedSeparators: ReadonlySet<string>;
    readonly confidence: PrivacyFindingConfidence;
};

const unsafeAiContractKeys = new Set([
    "rawStatementText",
    "originalPdfBytes",
    "accountNumber",
    "cardNumber",
    "identityNumber",
    "email",
    "phoneNumber",
    "description",
    "transactionDescription",
]);

export function detectSensitiveContent(
    input: PrivacyDetectionInput
): PrivacyDetectionResult {
    const findings = input.chunks.flatMap((chunk, chunkIndex) =>
        detectInternalMatches(chunk, chunkIndex).map(stripSensitiveValue)
    );

    return Object.freeze({
        findings: Object.freeze(findings),
        summary: summarizePrivacyFindings(findings),
    });
}

export function redactSensitiveText(input: RedactionInput): RedactionResult {
    assertRedactionSecret(input.secret);

    const chunk = {
        fieldName: input.fieldName,
        lineNumber: input.lineNumber,
        text: input.text,
    };
    const matches = detectInternalMatches(chunk, 0);
    const tokens = matches.map((match) => ({
        location: match.location,
        token: createRedactionToken(match.type, match.value, input.secret),
        type: match.type,
    }));
    const maskedText = applyMasks(input.text, matches);
    const findings = matches.map(stripSensitiveValue);

    return Object.freeze({
        findings: Object.freeze(findings),
        maskedText,
        summary: summarizePrivacyFindings(findings),
        tokens: Object.freeze(tokens),
    });
}

export function createRedactionToken(
    type: PrivacyFindingType,
    value: string,
    secret: string
) {
    assertRedactionSecret(secret);

    return `pii_${type}_${createHmac("sha256", secret)
        .update(`${type}:${normalizeSensitiveValue(value)}`)
        .digest("hex")
        .slice(0, 24)}`;
}

export function createSanitizedAiStatementContract(
    input: SanitizedAiStatementInput
): SanitizedAiStatementContract {
    const boundaryInput = { ...(input as Record<string, unknown>) };
    delete boundaryInput["transactions"];
    assertNoUnsafeAiContractKeys(boundaryInput);

    const contract = Object.freeze({
        contractVersion: "statement-ai-input.v1",
        redactionSummary: input.redaction.summary,
        redactionTokenCount: input.redaction.tokens.length,
        transactions: Object.freeze(
            input.transactions.map((transaction) =>
                Object.freeze({
                    amountMinor: transaction.amountMinor,
                    balanceMinor: transaction.balanceMinor,
                    currency: transaction.currency,
                    date: transaction.date,
                    direction: transaction.direction,
                    sourceLineNumber: transaction.sourceLineNumber,
                })
            )
        ),
        validationSummary: input.validationSummary,
    });

    assertNoUnsafeAiContractKeys(contract);

    return contract;
}

export function inspectPromptCandidate(
    input: PromptInspectionInput
): PromptInspectionResult {
    if (input.source !== "sanitized_contract") {
        return {
            failureCode: "prompt.not_sanitized_contract",
            safeDetails: {
                categories: [],
                findingCount: 0,
                source: input.source,
            },
            status: "blocked",
        };
    }

    const detection = detectSensitiveContent({
        chunks: [{ fieldName: "prompt", text: input.prompt }],
    });

    if (detection.findings.length > 0) {
        return {
            failureCode: "prompt.contains_sensitive_content",
            safeDetails: {
                categories: uniqueCategories(detection.findings),
                findingCount: detection.findings.length,
                source: input.source,
            },
            status: "blocked",
        };
    }

    return {
        safeDetails: {
            findingCount: 0,
            source: "sanitized_contract",
        },
        status: "approved",
    };
}

export function summarizePrivacyFindings(
    findings: readonly PrivacyFinding[]
): PrivacySummary {
    return Object.freeze({
        accountNumberCount: countFindings(findings, "account_number"),
        cardNumberCount: countFindings(findings, "card_number"),
        emailCount: countFindings(findings, "email"),
        findingCount: findings.length,
        identityNumberCount: countFindings(findings, "identity_number"),
        phoneNumberCount: countFindings(findings, "phone_number"),
    });
}

function detectInternalMatches(
    chunk: PrivacyTextChunk,
    chunkIndex: number
): readonly InternalPrivacyMatch[] {
    return dedupeOverlappingMatches([
        ...detectCardNumbers(chunk, chunkIndex),
        ...detectEmails(chunk, chunkIndex),
        ...detectLabeledDigitSequence(chunk, chunkIndex, {
            allowLeadingPlus: false,
            allowedSeparators: new Set([" ", "-"]),
            confidence: "medium",
            labelPattern: /\b(?:account|acct|acc)\b/giu,
            maxDigits: 18,
            maxLookahead: 64,
            minDigits: 8,
            type: "account_number",
        }),
        ...detectLabeledDigitSequence(chunk, chunkIndex, {
            allowLeadingPlus: false,
            allowedSeparators: new Set([" ", "-"]),
            confidence: "medium",
            labelPattern: /\b(?:id|identity)\b/giu,
            maxDigits: 17,
            maxLookahead: 64,
            minDigits: 9,
            type: "identity_number",
        }),
        ...detectLabeledDigitSequence(chunk, chunkIndex, {
            allowLeadingPlus: true,
            allowedSeparators: new Set([" ", "(", ")", "-"]),
            confidence: "medium",
            labelPattern: /\b(?:phone|mobile|cell|tel)\b/giu,
            maxDigits: 18,
            maxLookahead: 64,
            minDigits: 8,
            type: "phone_number",
        }),
    ]);
}

function detectCardNumbers(
    chunk: PrivacyTextChunk,
    chunkIndex: number
): readonly InternalPrivacyMatch[] {
    const matches: InternalPrivacyMatch[] = [];
    const cardPattern = /\b(?:\d[ -]?){13,19}\b/gu;

    for (const match of chunk.text.matchAll(cardPattern)) {
        const value = match[0];
        const digits = normalizeSensitiveValue(value);

        if (
            digits.length >= 13 &&
            digits.length <= 19 &&
            !allDigitsMatch(digits) &&
            passesLuhn(digits)
        ) {
            matches.push(
                createInternalMatch(
                    chunk,
                    chunkIndex,
                    "card_number",
                    "high",
                    match.index,
                    value
                )
            );
        }
    }

    return matches;
}

function detectEmails(
    chunk: PrivacyTextChunk,
    chunkIndex: number
): readonly InternalPrivacyMatch[] {
    const matches: InternalPrivacyMatch[] = [];
    const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/giu;

    for (const match of chunk.text.matchAll(emailPattern)) {
        matches.push(
            createInternalMatch(
                chunk,
                chunkIndex,
                "email",
                "high",
                match.index,
                match[0]
            )
        );
    }

    return matches;
}

function detectLabeledDigitSequence(
    chunk: PrivacyTextChunk,
    chunkIndex: number,
    config: LabeledDigitDetectorConfig
): readonly InternalPrivacyMatch[] {
    const matches: InternalPrivacyMatch[] = [];

    for (const match of chunk.text.matchAll(config.labelPattern)) {
        const candidate = readLabeledDigitCandidate(
            chunk.text,
            match.index + match[0].length,
            config
        );

        if (candidate !== null) {
            matches.push(
                createInternalMatch(
                    chunk,
                    chunkIndex,
                    config.type,
                    config.confidence,
                    candidate.startOffset,
                    candidate.value
                )
            );
        }
    }

    return matches;
}

function readLabeledDigitCandidate(
    text: string,
    startOffset: number,
    config: LabeledDigitDetectorConfig
): { readonly startOffset: number; readonly value: string } | null {
    const maxEndOffset = Math.min(
        text.length,
        startOffset + config.maxLookahead
    );
    let offset = skipLabelNoise(text, startOffset, maxEndOffset);
    offset = skipOptionalDescriptor(text, offset, maxEndOffset);
    offset = skipLabelNoise(text, offset, maxEndOffset);

    const valueStartOffset = offset;
    let valueEndOffset = offset;
    let digitCount = 0;

    while (valueEndOffset < maxEndOffset) {
        const char = text[valueEndOffset] ?? "";

        if (isDigit(char)) {
            digitCount += 1;
            valueEndOffset += 1;
            continue;
        }

        if (
            config.allowLeadingPlus &&
            char === "+" &&
            valueEndOffset === valueStartOffset
        ) {
            valueEndOffset += 1;
            continue;
        }

        if (config.allowedSeparators.has(char)) {
            valueEndOffset += 1;
            continue;
        }

        break;
    }

    const trimmed = trimCandidateValue(
        text.slice(valueStartOffset, valueEndOffset),
        valueStartOffset
    );

    if (
        trimmed === null ||
        digitCount < config.minDigits ||
        digitCount > config.maxDigits
    ) {
        return null;
    }

    return trimmed;
}

function skipLabelNoise(
    text: string,
    startOffset: number,
    maxEndOffset: number
) {
    let offset = startOffset;

    while (offset < maxEndOffset) {
        const char = text[offset] ?? "";

        if (
            char === " " ||
            char === "\t" ||
            char === ":" ||
            char === "." ||
            char === "-"
        ) {
            offset += 1;
            continue;
        }

        break;
    }

    return offset;
}

function skipOptionalDescriptor(
    text: string,
    startOffset: number,
    maxEndOffset: number
) {
    const remaining = text.slice(startOffset, maxEndOffset).toLowerCase();

    for (const descriptor of ["number", "no", "#"]) {
        if (
            remaining.startsWith(descriptor) &&
            !isAsciiLetter(remaining[descriptor.length] ?? "")
        ) {
            return startOffset + descriptor.length;
        }
    }

    return startOffset;
}

function trimCandidateValue(value: string, startOffset: number) {
    const leadingTrimmed = value.match(/^\D*/u)?.[0].length ?? 0;
    const trailingTrimmed = value.match(/\D*$/u)?.[0].length ?? 0;
    const trimmed = value.slice(
        leadingTrimmed,
        trailingTrimmed === 0 ? value.length : -trailingTrimmed
    );

    if (trimmed === "") {
        return null;
    }

    return {
        startOffset: startOffset + leadingTrimmed,
        value: trimmed,
    };
}

function isDigit(char: string) {
    return char >= "0" && char <= "9";
}

function isAsciiLetter(char: string) {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}

function createInternalMatch(
    chunk: PrivacyTextChunk,
    chunkIndex: number,
    type: PrivacyFindingType,
    confidence: PrivacyFindingConfidence,
    startOffset: number,
    value: string
): InternalPrivacyMatch {
    return {
        confidence,
        length: value.length,
        location: {
            chunkIndex,
            endOffset: startOffset + value.length,
            fieldName: chunk.fieldName,
            lineNumber: chunk.lineNumber,
            startOffset,
        },
        type,
        value,
    };
}

function stripSensitiveValue(match: InternalPrivacyMatch): PrivacyFinding {
    return {
        confidence: match.confidence,
        length: match.length,
        location: match.location,
        type: match.type,
    };
}

function applyMasks(text: string, matches: readonly InternalPrivacyMatch[]) {
    let maskedText = text;

    for (const [index, match] of Array.from(matches.entries()).reverse()) {
        const placeholder = `[REDACTED:${match.type.toUpperCase()}:${index + 1}]`;
        maskedText =
            maskedText.slice(0, match.location.startOffset) +
            placeholder +
            maskedText.slice(match.location.endOffset);
    }

    return maskedText;
}

function dedupeOverlappingMatches(
    matches: readonly InternalPrivacyMatch[]
): readonly InternalPrivacyMatch[] {
    return [...matches]
        .sort((left, right) => {
            const offsetDiff =
                left.location.startOffset - right.location.startOffset;

            if (offsetDiff !== 0) {
                return offsetDiff;
            }

            return right.length - left.length;
        })
        .reduce<InternalPrivacyMatch[]>((kept, candidate) => {
            const overlaps = kept.some(
                (finding) =>
                    candidate.location.startOffset <
                        finding.location.endOffset &&
                    candidate.location.endOffset > finding.location.startOffset
            );

            if (!overlaps) {
                kept.push(candidate);
            }

            return kept;
        }, []);
}

function normalizeSensitiveValue(value: string) {
    return value.replaceAll(/\D/g, "");
}

function countFindings(
    findings: readonly PrivacyFinding[],
    type: PrivacyFindingType
) {
    return findings.filter((finding) => finding.type === type).length;
}

function uniqueCategories(findings: readonly PrivacyFinding[]) {
    return Object.freeze([...new Set(findings.map((finding) => finding.type))]);
}

function assertRedactionSecret(secret: string) {
    if (secret.trim().length < 16) {
        throw new Error("Redaction token secret is too short");
    }
}

function assertNoUnsafeAiContractKeys(value: unknown, path = "input") {
    if (value === null || typeof value !== "object") {
        return;
    }

    for (const [key, childValue] of Object.entries(value)) {
        if (unsafeAiContractKeys.has(key)) {
            throw new Error(
                `Unsafe AI contract field is not allowed: ${path}.${key}`
            );
        }

        assertNoUnsafeAiContractKeys(childValue, `${path}.${key}`);
    }
}

function passesLuhn(digits: string) {
    let sum = 0;
    let shouldDouble = false;

    for (let index = digits.length - 1; index >= 0; index -= 1) {
        const digit = Number.parseInt(digits[index] ?? "0", 10);

        if (shouldDouble) {
            const doubled = digit * 2;
            sum += doubled > 9 ? doubled - 9 : doubled;
        } else {
            sum += digit;
        }

        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

function allDigitsMatch(digits: string) {
    return digits.split("").every((digit) => digit === digits[0]);
}
