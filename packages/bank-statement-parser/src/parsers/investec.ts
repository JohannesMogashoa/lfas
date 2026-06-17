import {
    extractTextItems,
    getDocumentProxy,
    type StructuredTextItem,
} from "unpdf";

import type { BankStatementParseResult, BankTransaction } from "../types";

const ROW_Y_TOLERANCE = 1.5;
type InvestecSection = "account" | "online-banking" | "card" | "other";

const INVESTEC_BOILERPLATE_PATTERNS = [
    /^30MAR\d{4}$/i,
    /^InvestecSpecialistBank,/i,
    /^PrivateBankAccountStatement/i,
    /^StatementDate/i,
    /^AccountNumber/i,
    /^Page\d+of\d+$/i,
    /^Transactiondetail/i,
    /^OnlineBankingpayments,?depositsandinterest/i,
    /^Cardtransactions/i,
    /^Subtotal/i,
    /^Total/i,
    /^Balancebroughtforward/i,
    /^ClosingBalance/i,
    /^DateDescription/i,
    /^ActiondateTransdateTransactionDescriptionDebitCreditBalance/i,
    /^Forafullbreakdownof/i,
    /^Ifyouhaveanyquestions/i,
    /^OmbudsmanforBankingServices/i,
    /^InvestecSpecialistBank,adivisionofInvestecBankLimited/i,
    /^NCRCP\d+/i,
    /^~Before31March2018/i,
    /^\*Thisisaninternationaltransaction/i,
    /^CopiesoftheCodeandtheOmbudsman/i,
    /^Aregisteredcreditprovider/i,
    /^100GraystonDrive/i,
    /^TheInvestecbranchcode/i,
];

export default async function parseInvestecStatement(
    bytes: ArrayBuffer
): Promise<BankStatementParseResult> {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { items } = await extractTextItems(pdf);
    const lines = items.flatMap((pageItems) => extractLinesFromPage(pageItems));
    const transactions = parseInvestecTextLines(lines);

    return {
        transactions,
        warnings:
            transactions.length === 0
                ? [
                      "No Investec transactions were extracted from the uploaded statement.",
                  ]
                : [],
    };
}

export function parseInvestecTextLines(
    lines: readonly string[]
): BankTransaction[] {
    const transactions: BankTransaction[] = [];
    let currentTransaction: BankTransaction | null = null;
    let currentSection: InvestecSection = "other";
    let previousRunningBalance: bigint | null = null;

    for (const rawLine of lines) {
        const line = normalizeText(rawLine);

        if (!line) {
            continue;
        }

        const section = matchInvestecSectionHeader(line);

        if (section) {
            currentSection = section;
            if (section !== "account") {
                previousRunningBalance = null;
            }
            continue;
        }

        if (isInvestecBoilerplateLine(line)) {
            continue;
        }

        const standaloneBalance = parseStandaloneInvestecBalanceLine(line);

        if (standaloneBalance !== null) {
            previousRunningBalance = standaloneBalance;
            continue;
        }

        const parsedTransaction = parseInvestecTransactionLine(line);

        if (parsedTransaction) {
            const settledTransaction = settleInvestecTransactionDirection(
                parsedTransaction,
                currentSection,
                previousRunningBalance
            );

            const settledBalance = settledTransaction.balance
                ? parseMoneyMinorUnits(settledTransaction.balance)
                : null;

            if (currentTransaction) {
                transactions.push(currentTransaction);
            }

            currentTransaction = settledTransaction;
            if (settledBalance !== null) {
                previousRunningBalance = settledBalance;
            }
            continue;
        }

        if (currentTransaction && isContinuationLine(line)) {
            currentTransaction = {
                ...currentTransaction,
                transactionDescription: `${currentTransaction.transactionDescription} ${line}`,
            };
        }
    }

    if (currentTransaction) {
        transactions.push(currentTransaction);
    }

    return transactions;
}

export function parseInvestecTransactionLine(
    line: string
): BankTransaction | null {
    const dateMatch = matchLeadingDateText(line);

    if (!dateMatch) {
        return null;
    }

    let remainder = line.slice(dateMatch.length).trimStart();
    const valueDateMatch = matchLeadingDateText(remainder);

    if (valueDateMatch) {
        remainder = remainder.slice(valueDateMatch.length).trimStart();
    }

    const trailingMoney = takeTrailingMoneyTokens(remainder);

    if (!trailingMoney.amount) {
        return null;
    }

    const transactionDescription = normalizeText(
        remainder.slice(0, trailingMoney.descriptionEnd)
    );

    if (!transactionDescription) {
        return null;
    }

    return {
        amount: trailingMoney.amount,
        balance: trailingMoney.balance,
        date: dateMatch.isoDate,
        debitOrCredit: trailingMoney.amount.startsWith("-")
            ? "Credit"
            : "Debit",
        transactionDescription,
    };
}

function extractLinesFromPage(items: readonly StructuredTextItem[]): string[] {
    const rows: { items: StructuredTextItem[]; y: number }[] = [];

    for (const item of [...items].sort((left, right) => {
        if (right.y !== left.y) {
            return right.y - left.y;
        }

        return left.x - right.x;
    })) {
        if (!item.str.trim()) {
            continue;
        }

        const lastRow = rows.at(-1);

        if (!lastRow || Math.abs(lastRow.y - item.y) > ROW_Y_TOLERANCE) {
            rows.push({
                items: [item],
                y: item.y,
            });
            continue;
        }

        lastRow.items.push(item);
        lastRow.y = (lastRow.y + item.y) / 2;
    }

    return rows
        .map((row) =>
            row.items
                .sort((left, right) => left.x - right.x)
                .map((item) => item.str)
                .join(" ")
        )
        .map(normalizeText)
        .filter(Boolean);
}

function matchLeadingDateText(
    value: string
): { isoDate: string; length: number } | null {
    const isoMatch = value.match(/^(\d{4})\s*[-/]\s*(\d{2})\s*[-/]\s*(\d{2})/u);

    if (isoMatch) {
        return {
            isoDate: `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`,
            length: isoMatch[0].length,
        };
    }

    const numericDateMatch = value.match(
        /^(\d{1,2})\s*[/-]\s*(\d{1,2})\s*[/-]\s*(\d{4})/u
    );

    if (numericDateMatch) {
        const day = numericDateMatch[1]!.padStart(2, "0");
        const month = numericDateMatch[2]!.padStart(2, "0");

        return {
            isoDate: `${numericDateMatch[3]}-${month}-${day}`,
            length: numericDateMatch[0].length,
        };
    }

    const textDateMatch = value.match(
        /^(\d{1,2})\s*([A-Za-z]{3,9})\s*(\d{4})/u
    );

    if (!textDateMatch) {
        return null;
    }

    const month = monthToNumber(textDateMatch[2]!);

    if (!month) {
        return null;
    }

    const day = textDateMatch[1]!.padStart(2, "0");

    return {
        isoDate: `${textDateMatch[3]}-${month}-${day}`,
        length: textDateMatch[0].length,
    };
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

function matchInvestecSectionHeader(value: string): InvestecSection | null {
    const squashedValue = squashText(value);

    if (squashedValue.startsWith("Transactiondetail")) {
        return "account";
    }

    if (squashedValue.startsWith("OnlineBankingpayments,depositsandinterest")) {
        return "online-banking";
    }

    if (squashedValue.startsWith("Cardtransactions")) {
        return "card";
    }

    return null;
}

function parseStandaloneInvestecBalanceLine(value: string): bigint | null {
    const squashedValue = squashText(value);

    if (
        !squashedValue.startsWith("Balancebroughtforward") &&
        !squashedValue.startsWith("OpeningBalance") &&
        !squashedValue.startsWith("ClosingBalance")
    ) {
        return null;
    }

    const trailingMoney = takeTrailingMoneyTokens(value);

    if (!trailingMoney.amount) {
        return null;
    }

    return parseMoneyMinorUnits(trailingMoney.amount);
}

function settleInvestecTransactionDirection(
    transaction: BankTransaction,
    section: InvestecSection,
    previousRunningBalance: bigint | null
): BankTransaction {
    const currentRunningBalance = transaction.balance
        ? parseMoneyMinorUnits(transaction.balance)
        : null;

    if (
        currentRunningBalance !== null &&
        previousRunningBalance !== null &&
        currentRunningBalance !== previousRunningBalance
    ) {
        return {
            ...transaction,
            debitOrCredit:
                currentRunningBalance > previousRunningBalance
                    ? "Credit"
                    : "Debit",
        };
    }

    if (section === "card") {
        return {
            ...transaction,
            debitOrCredit: "Debit",
        };
    }

    if (section === "online-banking") {
        return {
            ...transaction,
            debitOrCredit: isDebitLikeOnlineBankingDescription(
                transaction.transactionDescription
            )
                ? "Debit"
                : "Credit",
        };
    }

    return transaction;
}

function isDebitLikeOnlineBankingDescription(description: string) {
    return /fee|charge|debitinterest|servicecharge/i.test(description);
}

function takeTrailingMoneyTokens(text: string): {
    amount?: string;
    balance?: string;
    descriptionEnd: number;
} {
    const tokens = tokenize(text);
    let end = tokens.length;

    while (end > 0 && isDecorativeToken(tokens[end - 1]?.value ?? "")) {
        end -= 1;
    }

    if (end === 0) {
        return { descriptionEnd: 0 };
    }

    const lastToken = tokens[end - 1]!;

    if (!isMoneyToken(lastToken.value)) {
        return { descriptionEnd: text.length };
    }

    const precedingToken = end > 1 ? tokens[end - 2]! : undefined;
    const precedingMoneyToken = end > 2 ? tokens[end - 3]! : undefined;

    if (precedingToken && isMoneyToken(precedingToken.value)) {
        return {
            amount: normalizeMoneyText(precedingToken.value),
            balance: normalizeMoneyText(lastToken.value),
            descriptionEnd: precedingToken.start,
        };
    }

    if (precedingToken && isDecorativeToken(precedingToken.value)) {
        return {
            amount: normalizeMoneyText(lastToken.value),
            descriptionEnd:
                precedingMoneyToken && isMoneyToken(precedingMoneyToken.value)
                    ? precedingMoneyToken.start
                    : precedingToken.start,
        };
    }

    return {
        amount: normalizeMoneyText(lastToken.value),
        descriptionEnd: lastToken.start,
    };
}

function tokenize(text: string) {
    const tokens: { end: number; start: number; value: string }[] = [];
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

function normalizeMoneyText(value: string) {
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

function parseMoneyMinorUnits(value: string): bigint | null {
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

function isMoneyToken(value: string) {
    return MONEY_TOKEN_RE.test(value);
}

const MONEY_TOKEN_RE =
    /^(?:R\s*)?(?:\(|-)?\d+(?:[ ,]\d{3})*(?:[.,]\d{2})(?:\)|-)?$/u;

function isDecorativeToken(value: string) {
    return /^[~*]+$/u.test(value);
}

function isInvestecBoilerplateLine(value: string) {
    const squashedValue = squashText(value);

    return INVESTEC_BOILERPLATE_PATTERNS.some((pattern) =>
        pattern.test(squashedValue)
    );
}

function isContinuationLine(value: string) {
    return (
        /[A-Za-z0-9]/u.test(value) &&
        !matchLeadingDateText(value) &&
        !takeTrailingMoneyTokens(value).amount
    );
}

function normalizeText(value: string) {
    return value.replace(/\s+/gu, " ").trim();
}

function squashText(value: string) {
    return normalizeText(value).replace(/\s+/gu, "");
}
