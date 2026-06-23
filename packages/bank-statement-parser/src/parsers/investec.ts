import type { BankStatementParseResult, BankTransaction } from "../types";
import {
    extractTransactionAmount,
    extractTransactionDate,
    hasTrailingMoney,
    normalizeText,
    parseGenericTableRow,
    parseMoneyMinorUnits,
} from "../extraction/index.ts";
import { extractPdfTextLines } from "../pdf.ts";

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
    const lines = await extractPdfTextLines(bytes);
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
    const parsedRow = parseGenericTableRow(line);

    if (!parsedRow) {
        return null;
    }

    return {
        amount: parsedRow.amount.normalizedText,
        balance: parsedRow.balance?.normalizedText,
        date: parsedRow.date.isoDate,
        debitOrCredit: parsedRow.debitOrCredit,
        transactionDescription: parsedRow.description,
    };
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

    const trailingMoney = extractTransactionAmount(value);

    if (!trailingMoney) {
        return null;
    }

    return BigInt(trailingMoney.money.amountMinor);
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

function isInvestecBoilerplateLine(value: string) {
    const squashedValue = squashText(value);

    return INVESTEC_BOILERPLATE_PATTERNS.some((pattern) =>
        pattern.test(squashedValue)
    );
}

function isContinuationLine(value: string) {
    return (
        /[A-Za-z0-9]/u.test(value) &&
        !extractTransactionDate(value) &&
        !hasTrailingMoney(value)
    );
}

function squashText(value: string) {
    return normalizeText(value).replace(/\s+/gu, "");
}
