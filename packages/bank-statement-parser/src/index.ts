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

const datePattern =
    /(?<date>\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})\s+(?<description>.+?)\s+(?<amount>-?\d[\d\s,.]*)(?:\s+(?<balance>-?\d[\d\s,.]*))?$/u;

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
    const match = datePattern.exec(line);

    if (!match?.groups) {
        return null;
    }

    const {
        amount: rawAmount,
        balance: rawBalance,
        date,
        description,
    } = match.groups;

    if (!rawAmount || !date || !description) {
        return null;
    }

    const amount = normalizeMoneyText(rawAmount);
    const balance = rawBalance ? normalizeMoneyText(rawBalance) : undefined;

    return {
        amount,
        balance,
        date: normalizeDateText(date),
        debitOrCredit: amount.startsWith("-") ? "Debit" : "Credit",
        transactionDescription: description.trim(),
    };
}

function normalizeDateText(value: string) {
    if (/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
        return value;
    }

    const [day, month, year] = value.split(/[/-]/u);

    if (!day || !month || !year) {
        return value;
    }

    return `${year}-${month}-${day}`;
}

function normalizeMoneyText(value: string) {
    return value.replace(/\s/gu, "").replace(/,/gu, ".");
}
