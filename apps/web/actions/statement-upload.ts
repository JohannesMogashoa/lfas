"use server";

import type { FileWithPreview } from "@/hooks/use-file-upload";
import {
    type BankTransaction,
    parseBankStatementPdf,
} from "@lfas/bank-statement-parser";

export type StatementUploadResult = {
    success: boolean;
    error?: string;
    transactions: BankTransaction[];
    warnings: string[];
    failed: string[];
};

export async function uploadStatements(files: FileWithPreview[]) {
    const transactions: BankTransaction[] = [];
    const warnings: string[] = [];
    const failed: string[] = [];

    for (const { file } of files) {
        if (file instanceof File) {
            const {
                transactions: parsedTransactions,
                warnings: parsedWarnings,
            } = await parseBankStatementPdf(await file.arrayBuffer());
            transactions.push(...parsedTransactions);
            warnings.push(...parsedWarnings);
        } else {
            failed.push(file.name);
        }
    }

    return {
        transactions: sortTransactionsByDate(transactions),
        warnings,
        failed,
    };
}

export async function uploadFileAction(formData: FormData) {
    const result: StatementUploadResult = {
        error: undefined,
        success: false,
        transactions: [],
        warnings: [],
        failed: [],
    };
    const files = formData.getAll("statements") as File[];

    if (!files || files.length === 0 || files[0]?.size === 0) {
        result.error = "No files were uploaded";
        return result;
    }

    for (const file of files) {
        const bytes = await file.arrayBuffer();
        const { transactions, warnings } = await parseBankStatementPdf(
            bytes,
            "Investec"
        );

        result.transactions.push(...transactions);
        result.warnings.push(...warnings);
    }

    result.transactions = sortTransactionsByDate(result.transactions);
    result.success = true;

    return result;
}

function sortTransactionsByDate(transactions: BankTransaction[]) {
    return [...transactions].sort((a, b) => a.date.localeCompare(b.date));
}
