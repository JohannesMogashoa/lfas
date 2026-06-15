export type DebitOrCredit = "Debit" | "Credit";

export type BankTransaction = {
    readonly date: string;
    readonly transactionDescription: string;
    readonly amount: string;
    readonly debitOrCredit: DebitOrCredit;
    readonly balance?: string;
};

export type BankStatementParseResult = {
    readonly transactions: BankTransaction[];
    readonly warnings: string[];
};

export async function parseBankStatementPdf(
    bytes: ArrayBuffer,
    bankName?: string
): Promise<BankStatementParseResult> {
    const text = decodeLikelyText(bytes);
    const transactions = parseTextTransactions(text);
    const warnings: string[] = [];

    if (transactions.length === 0) {
        warnings.push(
            bankName
                ? `No ${bankName} transactions were extracted from the uploaded statement.`
                : "No transactions were extracted from the uploaded statement."
        );
    }

    if (text.startsWith("%PDF")) {
        warnings.push(
            "The parser contract is available, but full PDF text extraction is not implemented in this package yet."
        );
    }

    return { transactions, warnings };
}

function decodeLikelyText(bytes: ArrayBuffer) {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function parseTextTransactions(text: string) {
    return text
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .map(parseTransactionLine)
        .filter(
            (transaction): transaction is BankTransaction =>
                transaction !== null
        );
}

function parseTransactionLine(line: string): BankTransaction | null {
    const dateBoundary = findDateBoundary(line);

    if (!dateBoundary) {
        return null;
    }

    const moneyTokens = takeTrailingMoneyTokens(line.slice(dateBoundary.end));

    if (!moneyTokens.amount) {
        return null;
    }

    const description = line
        .slice(dateBoundary.end, moneyTokens.descriptionEnd)
        .trim();

    if (!description) {
        return null;
    }

    return {
        amount: moneyTokens.amount,
        balance: moneyTokens.balance,
        date: normalizeDateText(dateBoundary.rawDate),
        debitOrCredit: moneyTokens.amount.startsWith("-") ? "Debit" : "Credit",
        transactionDescription: description,
    };
}

function findDateBoundary(
    line: string
): { rawDate: string; end: number } | null {
    const trimmedLine = line.trimStart();
    const leadingWhitespace = line.length - trimmedLine.length;
    const firstTokenEnd = trimmedLine.search(/\s/u);
    const rawDate =
        firstTokenEnd === -1
            ? trimmedLine
            : trimmedLine.slice(0, firstTokenEnd);

    if (!isSupportedDateText(rawDate)) {
        return null;
    }

    return {
        end: leadingWhitespace + rawDate.length,
        rawDate,
    };
}

function takeTrailingMoneyTokens(textAfterDate: string): {
    amount?: string;
    balance?: string;
    descriptionEnd: number;
} {
    const first = takeLastWhitespaceSeparatedToken(
        textAfterDate,
        textAfterDate.length
    );

    if (!first || !isMoneyText(first.value)) {
        return { descriptionEnd: textAfterDate.length };
    }

    const second = takeLastWhitespaceSeparatedToken(textAfterDate, first.start);

    if (second && isMoneyText(second.value)) {
        return {
            amount: normalizeMoneyText(second.value),
            balance: normalizeMoneyText(first.value),
            descriptionEnd: second.start,
        };
    }

    return {
        amount: normalizeMoneyText(first.value),
        descriptionEnd: first.start,
    };
}

function takeLastWhitespaceSeparatedToken(
    value: string,
    endExclusive: number
): { value: string; start: number } | null {
    let end = endExclusive;

    while (end > 0 && isWhitespace(value.charCodeAt(end - 1))) {
        end -= 1;
    }

    if (end === 0) {
        return null;
    }

    let start = end;

    while (start > 0 && !isWhitespace(value.charCodeAt(start - 1))) {
        start -= 1;
    }

    return {
        start,
        value: value.slice(start, end),
    };
}

function isWhitespace(charCode: number) {
    return (
        charCode === 9 || charCode === 10 || charCode === 13 || charCode === 32
    );
}

function isSupportedDateText(value: string) {
    return isIsoDateText(value) || /^\d{2}[/-]\d{2}[/-]\d{4}$/u.test(value);
}

function normalizeDateText(value: string) {
    if (isIsoDateText(value)) {
        return value;
    }

    const [day, month, year] = value.split(/[/-]/u);

    if (!day || !month || !year) {
        return value;
    }

    return `${year}-${month}-${day}`;
}

function normalizeMoneyText(value: string) {
    return value.replace(/,/gu, ".");
}

function isIsoDateText(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/u.test(value);
}

function isMoneyText(value: string) {
    if (value.length === 0) {
        return false;
    }

    let decimalSeparatorCount = 0;
    let digitCount = 0;

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];

        if (char === "-" && index === 0) {
            continue;
        }

        if (char === "." || char === ",") {
            decimalSeparatorCount += 1;

            if (decimalSeparatorCount > 1) {
                return false;
            }

            continue;
        }

        if (!char || char < "0" || char > "9") {
            return false;
        }

        digitCount += 1;
    }

    return digitCount > 0;
}
