import type { Money } from "@lfas/domain";
import { parseDecimalMoney } from "@lfas/domain";

import type { DebitOrCredit } from "../types.ts";

export type TextSpan = {
    readonly start: number;
    readonly end: number;
};

export type ExtractedDate = {
    readonly isoDate: string;
    readonly rawText: string;
    readonly span: TextSpan;
};

export type ExtractedMoney = {
    readonly money: Money;
    readonly normalizedText: string;
    readonly rawText: string;
    readonly span: TextSpan;
};

export type ExtractedDescription = {
    readonly description: string;
    readonly reference?: string;
};

export type GenericTableRow = {
    readonly date: ExtractedDate;
    readonly secondaryDate?: ExtractedDate;
    readonly description: string;
    readonly reference?: string;
    readonly amount: ExtractedMoney;
    readonly balance?: ExtractedMoney;
    readonly debitOrCredit: DebitOrCredit;
};

export function extractTransactionDate(text: string): ExtractedDate | null {
    return matchDateText(text, false);
}

export function extractTransactionAmount(text: string): ExtractedMoney | null {
    return takeTrailingMoneyTokens(text).amount ?? null;
}

export function extractTransactionBalance(text: string): ExtractedMoney | null {
    return takeTrailingMoneyTokens(text).balance ?? null;
}

export function extractDescriptionAndReference(
    text: string,
    spans: readonly TextSpan[]
): ExtractedDescription | null {
    const descriptionText = removeSpans(text, spans);
    const normalizedDescription = normalizeText(descriptionText);

    if (!normalizedDescription) {
        return null;
    }

    const referenceMatch = normalizedDescription.match(
        /^(?<description>.+?)\s+(?:ref|reference)\s*[:#-]?\s*(?<reference>[A-Za-z0-9][A-Za-z0-9-]*)$/iu
    );

    if (!referenceMatch?.groups) {
        return { description: normalizedDescription };
    }

    const description = normalizeText(referenceMatch.groups.description ?? "");
    const reference = referenceMatch.groups.reference;

    if (!description || !reference) {
        return { description: normalizedDescription };
    }

    return { description, reference };
}

export function parseGenericTableRow(text: string): GenericTableRow | null {
    const date = matchDateText(text, true);

    if (!date) {
        return null;
    }

    let remainder = text.slice(date.span.end).trimStart();
    const matchedSecondaryDate = matchDateText(remainder, true);
    let secondaryDate: ExtractedDate | undefined;

    if (matchedSecondaryDate) {
        const offset = text.indexOf(remainder);
        remainder = remainder.slice(matchedSecondaryDate.span.end).trimStart();
        secondaryDate = {
            ...matchedSecondaryDate,
            span: {
                end: matchedSecondaryDate.span.end + offset,
                start: matchedSecondaryDate.span.start + offset,
            },
        };
    }

    const trailingMoney = takeTrailingMoneyTokens(remainder);

    if (!trailingMoney.amount) {
        return null;
    }

    const remainderOffset = text.indexOf(remainder);
    const amount = offsetExtractedMoney(trailingMoney.amount, remainderOffset);
    const balance =
        trailingMoney.balance === undefined
            ? undefined
            : offsetExtractedMoney(trailingMoney.balance, remainderOffset);
    const description = extractDescriptionAndReference(remainder, [
        trailingMoney.amount.span,
        ...(trailingMoney.balance ? [trailingMoney.balance.span] : []),
        ...trailingMoney.decorativeSpans,
    ]);

    if (!description) {
        return null;
    }

    return {
        amount,
        balance,
        date,
        debitOrCredit: amount.normalizedText.startsWith("-")
            ? "Credit"
            : "Debit",
        description: description.description,
        reference: description.reference,
        secondaryDate,
    };
}

export function normalizeText(value: string) {
    return value.replace(/\s+/gu, " ").trim();
}

export function normalizeMoneyText(value: string) {
    const trimmed = value.trim();
    const cleaned = trimmed.replace(/^R\s*/iu, "");
    const isNegative =
        cleaned.startsWith("(") ||
        cleaned.startsWith("-") ||
        cleaned.endsWith("-") ||
        cleaned.endsWith(")");

    let normalized = cleaned.replace(/[()-]/gu, "").replace(/\s+/gu, "");

    if (normalized.includes(",") && normalized.includes(".")) {
        normalized = normalized.replace(/,/gu, "");
    } else if (normalized.includes(",")) {
        const parts = normalized.split(",");

        if (parts.length === 2 && parts[1]?.length === 2) {
            normalized = parts.join(".");
        } else {
            normalized = normalized.replace(/,/gu, "");
        }
    }

    return isNegative ? `-${normalized}` : normalized;
}

export function parseMoneyMinorUnits(value: string): bigint | null {
    const normalized = normalizeMoneyText(value);
    const negative = normalized.startsWith("-");
    const unsigned = negative ? normalized.slice(1) : normalized;
    const [wholePart, fractionPart = ""] = unsigned.split(".");

    if (!wholePart || !/^\d+$/u.test(wholePart)) {
        return null;
    }

    if (fractionPart && !/^\d{1,2}$/u.test(fractionPart)) {
        return null;
    }

    const fraction = `${fractionPart}00`.slice(0, 2);
    const minorUnits = BigInt(wholePart) * 100n + BigInt(fraction);

    return negative ? -minorUnits : minorUnits;
}

export function hasTrailingMoney(text: string) {
    return takeTrailingMoneyTokens(text).amount !== undefined;
}

function matchDateText(
    text: string,
    leadingOnly: boolean
): ExtractedDate | null {
    const patterns = [
        /(?<year>\d{4})\s*[-/]\s*(?<month>\d{2})\s*[-/]\s*(?<day>\d{2})/u,
        /(?<day>\d{1,2})\s*[/-]\s*(?<month>\d{1,2})\s*[/-]\s*(?<year>\d{4})/u,
        /(?<day>\d{1,2})\s*(?<monthName>[A-Za-z]{3,9})\s*(?<year>\d{4})/u,
    ];

    for (const pattern of patterns) {
        const match = leadingOnly
            ? text.match(new RegExp(`^${pattern.source}`, pattern.flags))
            : pattern.exec(text);

        if (!match?.groups || match.index === undefined) {
            continue;
        }

        const month =
            match.groups.month ?? monthToNumber(match.groups.monthName ?? "");
        const day = match.groups.day;
        const year = match.groups.year;

        if (!day || !month || !year) {
            continue;
        }

        const isoDate = normalizeDateParts(year, month, day);

        if (!isoDate) {
            continue;
        }

        return {
            isoDate,
            rawText: match[0],
            span: {
                end: match.index + match[0].length,
                start: match.index,
            },
        };
    }

    return null;
}

function normalizeDateParts(
    year: string,
    month: string,
    day: string
): string | null {
    const normalizedMonth = month.padStart(2, "0");
    const normalizedDay = day.padStart(2, "0");
    const monthNumber = Number.parseInt(normalizedMonth, 10);
    const dayNumber = Number.parseInt(normalizedDay, 10);

    if (
        monthNumber < 1 ||
        monthNumber > 12 ||
        dayNumber < 1 ||
        dayNumber > 31
    ) {
        return null;
    }

    const isoDate = `${year}-${normalizedMonth}-${normalizedDay}`;
    const parsedDate = new Date(`${isoDate}T00:00:00.000Z`);

    if (
        parsedDate.getUTCFullYear() !== Number.parseInt(year, 10) ||
        parsedDate.getUTCMonth() + 1 !== monthNumber ||
        parsedDate.getUTCDate() !== dayNumber
    ) {
        return null;
    }

    return isoDate;
}

function monthToNumber(month: string): string | null {
    const lookup = new Map<string, string>([
        ["jan", "01"],
        ["january", "01"],
        ["feb", "02"],
        ["february", "02"],
        ["mar", "03"],
        ["march", "03"],
        ["apr", "04"],
        ["april", "04"],
        ["may", "05"],
        ["jun", "06"],
        ["june", "06"],
        ["jul", "07"],
        ["july", "07"],
        ["aug", "08"],
        ["august", "08"],
        ["sep", "09"],
        ["sept", "09"],
        ["september", "09"],
        ["oct", "10"],
        ["october", "10"],
        ["nov", "11"],
        ["november", "11"],
        ["dec", "12"],
        ["december", "12"],
    ]);

    return lookup.get(month.toLowerCase()) ?? null;
}

function takeTrailingMoneyTokens(text: string): {
    amount?: ExtractedMoney;
    balance?: ExtractedMoney;
    decorativeSpans: TextSpan[];
} {
    const tokens = tokenize(text);
    const decorativeSpans: TextSpan[] = [];
    let end = tokens.length;

    while (end > 0 && isDecorativeToken(tokens[end - 1]?.value ?? "")) {
        decorativeSpans.push(toSpan(tokens[end - 1]!));
        end -= 1;
    }

    if (end === 0) {
        return { decorativeSpans };
    }

    const lastToken = takeMoneyTokenAt(tokens, end - 1);

    assertSupportedMoneyToken(lastToken.token.value);

    if (!lastToken.money) {
        return { decorativeSpans };
    }

    const precedingIndex = lastToken.startIndex - 1;
    const precedingToken =
        precedingIndex >= 0
            ? takeMoneyTokenAt(tokens, precedingIndex)
            : undefined;
    const precedingMoneyToken =
        precedingToken && precedingToken.startIndex > 0
            ? takeMoneyTokenAt(tokens, precedingToken.startIndex - 1)
            : undefined;

    if (precedingToken) {
        assertSupportedMoneyToken(precedingToken.token.value);
    }

    if (precedingToken?.money) {
        return {
            amount: createExtractedMoney(precedingToken.token),
            balance: createExtractedMoney(lastToken.token),
            decorativeSpans,
        };
    }

    if (precedingToken && isDecorativeToken(precedingToken.token.value)) {
        decorativeSpans.push(toSpan(precedingToken.token));

        if (precedingMoneyToken?.money) {
            decorativeSpans.push(toSpan(precedingMoneyToken.token));
        }

        return {
            amount: createExtractedMoney(lastToken.token),
            decorativeSpans,
        };
    }

    return {
        amount: createExtractedMoney(lastToken.token),
        decorativeSpans,
    };
}

function createExtractedMoney(token: Token): ExtractedMoney {
    const normalizedText = normalizeMoneyText(token.value);

    return {
        money: parseDecimalMoney(normalizedText),
        normalizedText,
        rawText: token.value,
        span: toSpan(token),
    };
}

function offsetExtractedMoney(
    extractedMoney: ExtractedMoney,
    offset: number
): ExtractedMoney {
    return {
        ...extractedMoney,
        span: {
            end: extractedMoney.span.end + offset,
            start: extractedMoney.span.start + offset,
        },
    };
}

function removeSpans(text: string, spans: readonly TextSpan[]) {
    const sortedSpans = [...spans].sort(
        (left, right) => left.start - right.start
    );
    let result = "";
    let cursor = 0;

    for (const span of sortedSpans) {
        result += text.slice(cursor, span.start);
        cursor = Math.max(cursor, span.end);
    }

    return result + text.slice(cursor);
}

type Token = {
    readonly end: number;
    readonly start: number;
    readonly value: string;
};

function takeMoneyTokenAt(
    tokens: readonly Token[],
    index: number
): {
    readonly money: boolean;
    readonly startIndex: number;
    readonly token: Token;
} {
    const token = tokens[index]!;
    const previousToken = index > 0 ? tokens[index - 1] : undefined;

    if (
        previousToken &&
        /^\d+$/u.test(previousToken.value) &&
        isMoneyToken(`${previousToken.value} ${token.value}`)
    ) {
        return {
            money: true,
            startIndex: index - 1,
            token: {
                end: token.end,
                start: previousToken.start,
                value: `${previousToken.value} ${token.value}`,
            },
        };
    }

    return {
        money: isMoneyToken(token.value),
        startIndex: index,
        token,
    };
}

function tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    let index = 0;

    while (index < text.length) {
        while (index < text.length && /\s/u.test(text[index] ?? "")) {
            index += 1;
        }

        const start = index;

        while (index < text.length && !/\s/u.test(text[index] ?? "")) {
            index += 1;
        }

        if (start < index) {
            tokens.push({
                end: index,
                start,
                value: text.slice(start, index),
            });
        }
    }

    return tokens;
}

function toSpan(token: Token): TextSpan {
    return {
        end: token.end,
        start: token.start,
    };
}

function isMoneyToken(value: string) {
    return MONEY_TOKEN_RE.test(value);
}

const MONEY_TOKEN_RE =
    /^(?:R\s*)?(?:\(|-)?\d+(?:[ ,]\d{3})*(?:[.,]\d{2})(?:\)|-)?$/u;

function assertSupportedMoneyToken(value: string) {
    if (
        /^(?:R\s*)?(?:\(|-)?\d+(?:[ ,]\d{3})*[.,]\d{3,}(?:\)|-)?$/u.test(value)
    ) {
        throw new Error(`Invalid decimal money amount: ${value}`);
    }
}

function isDecorativeToken(value: string) {
    return /^[~*]+$/u.test(value);
}
