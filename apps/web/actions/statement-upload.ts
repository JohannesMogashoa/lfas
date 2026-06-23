"use server";

import { createHash, randomUUID } from "node:crypto";

import type { FileWithPreview } from "@/hooks/use-file-upload";
import {
    type BankTransaction,
    parseDetectedBankStatementPdf,
} from "@lfas/bank-statement-parser";
import {
    createIdempotencyKey,
    createSourceFingerprint,
    normalizeParsedTransactions,
} from "@lfas/statement-processing";
import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export type StatementUploadResult = {
    success: boolean;
    error?: string;
    jobIds: string[];
    submissionIds: string[];
    transactions: BankTransaction[];
    warnings: string[];
    failed: string[];
};

export async function uploadStatements(files: FileWithPreview[]) {
    const result = createEmptyUploadResult();

    for (const { file } of files) {
        if (file instanceof File) {
            await processStatementFile(file, result);
        } else {
            result.failed.push(file.name);
        }
    }

    result.transactions = sortTransactionsByDate(result.transactions);
    result.success = result.failed.length === 0 && result.error === undefined;

    return result;
}

export async function uploadFileAction(formData: FormData) {
    const result = createEmptyUploadResult();
    const files = formData.getAll("statements") as File[];

    if (!files || files.length === 0 || files[0]?.size === 0) {
        result.error = "No files were uploaded";
        return result;
    }

    for (const file of files) {
        await processStatementFile(file, result);
    }

    result.transactions = sortTransactionsByDate(result.transactions);
    result.success = result.failed.length === 0 && result.error === undefined;

    return result;
}

function sortTransactionsByDate(transactions: BankTransaction[]) {
    return [...transactions].sort((a, b) => a.date.localeCompare(b.date));
}

function createEmptyUploadResult(): StatementUploadResult {
    return {
        error: undefined,
        failed: [],
        jobIds: [],
        submissionIds: [],
        success: false,
        transactions: [],
        warnings: [],
    };
}

async function processStatementFile(file: File, result: StatementUploadResult) {
    const client = createConvexClient();
    const bytes = await file.arrayBuffer();
    const userId = "anonymous";
    const uploadId = randomUUID();
    const correlationId = randomUUID();
    const fingerprint = createSourceFingerprint(
        bytes,
        getStatementFingerprintSecret()
    );
    const idempotencyKey = createIdempotencyKey(fingerprint, userId);
    let durableJob: {
        readonly duplicate: boolean;
        readonly jobId?: Id<"statementJobs">;
        readonly submissionId: Id<"statementSubmissions">;
    } | null = null;
    let durableFailureRecorded = false;

    try {
        const parsedStatement = await parseDetectedBankStatementPdf(bytes);
        const detection = parsedStatement.detection;
        const bank =
            detection.status === "detected" ? detection.bank : undefined;

        durableJob =
            client === null
                ? null
                : await client.mutation(api.statements.createSubmission, {
                      bankHint: bank,
                      byteSize: file.size,
                      correlationId,
                      idempotencyKey,
                      mimeType: file.type || "application/pdf",
                      sourceFingerprint: fingerprint,
                      uploadId,
                      userId,
                  });

        if (durableJob?.submissionId) {
            result.submissionIds.push(durableJob.submissionId);
        }

        if (durableJob?.jobId) {
            result.jobIds.push(durableJob.jobId);
        }

        if (
            client !== null &&
            durableJob?.duplicate !== true &&
            durableJob?.jobId
        ) {
            await client.mutation(api.statements.startExtraction, {
                jobId: durableJob.jobId,
                submissionId: durableJob.submissionId,
            });
        }

        result.transactions.push(...parsedStatement.transactions);
        result.warnings.push(...parsedStatement.warnings);

        if (detection.status === "unknown") {
            durableFailureRecorded = await failDurableProcessing(client, {
                durableJob,
                failureCode: "bank_detection_unknown",
                failureMessageSafe:
                    "Statement bank could not be identified from supported detection signals.",
            });
            result.failed.push(file.name);
            result.error = "One or more statements could not be processed.";
            return;
        }

        if (detection.implementationStatus === "placeholder") {
            durableFailureRecorded = await failDurableProcessing(client, {
                durableJob,
                failureCode: "bank_parser_not_implemented",
                failureMessageSafe:
                    "Statement bank was detected, but its parser is not implemented yet.",
            });
            result.failed.push(file.name);
            result.error = "One or more statements could not be processed.";
            return;
        }

        const normalizedTransactions = normalizeParsedTransactions(
            detection.bank,
            parsedStatement.transactions
        );

        if (client === null) {
            result.warnings.push(
                "Convex processing store is not configured; parsed without durable orchestration."
            );
            return;
        }

        if (durableJob?.duplicate === true || !durableJob?.jobId) {
            result.warnings.push(
                "Duplicate statement upload detected; existing durable processing record was reused."
            );
            return;
        }

        await client.mutation(api.statements.completeNormalization, {
            jobId: durableJob.jobId,
            safeDetails: {
                transactionCount: normalizedTransactions.length,
                warningCount: parsedStatement.warnings.length,
            },
            submissionId: durableJob.submissionId,
            transactions: normalizedTransactions,
        });
        await client.mutation(api.statements.completeValidation, {
            jobId: durableJob.jobId,
            safeDetails: {
                transactionCount: normalizedTransactions.length,
            },
            submissionId: durableJob.submissionId,
        });
        await client.mutation(api.statements.markSourceDisposed, {
            jobId: durableJob.jobId,
            submissionId: durableJob.submissionId,
        });
        await client.mutation(api.statements.markReportReady, {
            checksum: checksumNormalizedTransactions(normalizedTransactions),
            downloadName: `${detection.bank}-statement-transactions.json`,
            format: "json",
            jobId: durableJob.jobId,
            submissionId: durableJob.submissionId,
        });
    } catch (error) {
        if (client !== null && durableJob?.jobId && !durableFailureRecorded) {
            await client.mutation(api.statements.failJob, {
                failureCode: "statement_processing_failed",
                failureMessageSafe:
                    error instanceof Error
                        ? error.message
                        : "Statement processing failed",
                jobId: durableJob.jobId,
                submissionId: durableJob.submissionId,
            });
        }

        result.failed.push(file.name);
        result.error = "One or more statements could not be processed.";
    }
}

function createConvexClient() {
    const convexUrl =
        process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;

    return convexUrl ? new ConvexHttpClient(convexUrl) : null;
}

async function failDurableProcessing(
    client: ConvexHttpClient | null,
    args: {
        readonly durableJob: {
            readonly duplicate: boolean;
            readonly jobId?: Id<"statementJobs">;
            readonly submissionId: Id<"statementSubmissions">;
        } | null;
        readonly failureCode: string;
        readonly failureMessageSafe: string;
    }
) {
    if (
        client === null ||
        args.durableJob?.duplicate === true ||
        !args.durableJob?.jobId
    ) {
        return false;
    }

    await client.mutation(api.statements.failJob, {
        failureCode: args.failureCode,
        failureMessageSafe: args.failureMessageSafe,
        jobId: args.durableJob.jobId,
        submissionId: args.durableJob.submissionId,
    });

    return true;
}

function getStatementFingerprintSecret() {
    const secret = process.env.STATEMENT_FINGERPRINT_SECRET;

    if (secret) {
        return secret;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("STATEMENT_FINGERPRINT_SECRET must be configured");
    }

    return "local-development-statement-fingerprint-secret";
}

function checksumNormalizedTransactions(
    transactions: ReturnType<typeof normalizeParsedTransactions>
) {
    return createHash("sha256")
        .update(JSON.stringify(transactions))
        .digest("hex");
}
