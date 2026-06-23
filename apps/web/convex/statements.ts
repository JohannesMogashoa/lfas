import {
    assertProcessingStateTransition,
    ProcessingEvent,
    ProcessingState,
} from "@lfas/statement-processing/states";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const bank = v.union(
    v.literal("investec"),
    v.literal("absa"),
    v.literal("fnb"),
    v.literal("capitec"),
    v.literal("standard_bank"),
    v.literal("nedbank")
);

const normalizedTransaction = v.object({
    amountMinor: v.number(),
    balanceMinor: v.optional(v.number()),
    bank,
    currency: v.literal("ZAR"),
    date: v.string(),
    description: v.string(),
    direction: v.union(v.literal("debit"), v.literal("credit")),
    sourceLineNumber: v.number(),
});

const safeDetails = v.record(
    v.string(),
    v.union(v.string(), v.number(), v.boolean())
);

export const getSubmission = query({
    args: {
        submissionId: v.id("statementSubmissions"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.submissionId);
    },
});

export const createSubmission = mutation({
    args: {
        bankHint: v.optional(bank),
        byteSize: v.number(),
        correlationId: v.string(),
        idempotencyKey: v.string(),
        mimeType: v.string(),
        sourceFingerprint: v.string(),
        sourceIpAddress: v.optional(v.string()),
        uploadId: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("statementSubmissions")
            .withIndex("by_user_idempotency", (q) =>
                q
                    .eq("userId", args.userId)
                    .eq("idempotencyKey", args.idempotencyKey)
            )
            .unique();

        if (existing !== null) {
            return {
                duplicate: true,
                jobId: existing.currentJobId,
                submissionId: existing._id,
            };
        }

        const now = Date.now();
        const submissionId = await ctx.db.insert("statementSubmissions", {
            bankHint: args.bankHint,
            byteSize: args.byteSize,
            correlationId: args.correlationId,
            createdAt: now,
            idempotencyKey: args.idempotencyKey,
            mimeType: args.mimeType,
            sourceFingerprint: args.sourceFingerprint,
            status: ProcessingState.INTAKE_RECEIVED,
            updatedAt: now,
            userId: args.userId,
        });
        const jobId = await ctx.db.insert("statementJobs", {
            attempt: 1,
            createdAt: now,
            currentStep: "intake",
            intakeReceivedAt: now,
            state: ProcessingState.INTAKE_RECEIVED,
            submissionId,
            updatedAt: now,
        });

        await ctx.db.patch(submissionId, { currentJobId: jobId });
        await insertEvent(ctx, {
            eventType: ProcessingEvent.INTAKE_ACCEPTED,
            jobId,
            submissionId,
            toState: ProcessingState.INTAKE_RECEIVED,
        });
        await ctx.db.insert("statementAuditEvents", {
            correlationId: args.correlationId,
            createdAt: now,
            jobId,
            kind: "upload_accepted",
            sourceIpAddress: args.sourceIpAddress,
            submissionId,
            uploadId: args.uploadId,
            uploadedByUserId: args.userId,
        });

        return { duplicate: false, jobId, submissionId };
    },
});

export const startExtraction = mutation({
    args: {
        jobId: v.id("statementJobs"),
        submissionId: v.id("statementSubmissions"),
    },
    handler: async (ctx, args) => {
        await advanceJob(ctx, args, {
            eventType: ProcessingEvent.EXTRACTION_STARTED,
            milestone: "extractionStartedAt",
            step: "extracting",
            toState: ProcessingState.EXTRACTING,
        });
    },
});

export const completeNormalization = mutation({
    args: {
        jobId: v.id("statementJobs"),
        safeDetails: v.optional(safeDetails),
        submissionId: v.id("statementSubmissions"),
        transactions: v.array(normalizedTransaction),
    },
    handler: async (ctx, args) => {
        const existingTransactions = await ctx.db
            .query("statementTransactions")
            .withIndex("by_submission_id", (q) =>
                q.eq("submissionId", args.submissionId)
            )
            .collect();

        await Promise.all(
            existingTransactions.map((transaction) =>
                ctx.db.delete(transaction._id)
            )
        );

        const now = Date.now();
        await Promise.all(
            args.transactions.map((transaction) =>
                ctx.db.insert("statementTransactions", {
                    ...transaction,
                    createdAt: now,
                    submissionId: args.submissionId,
                })
            )
        );

        await advanceJob(ctx, args, {
            eventType: ProcessingEvent.NORMALIZATION_COMPLETED,
            milestone: "normalizedAt",
            safeDetails: args.safeDetails,
            step: "normalized",
            toState: ProcessingState.NORMALIZED,
        });
    },
});

export const completeValidation = mutation({
    args: {
        jobId: v.id("statementJobs"),
        safeDetails: v.optional(safeDetails),
        submissionId: v.id("statementSubmissions"),
    },
    handler: async (ctx, args) => {
        await advanceJob(ctx, args, {
            eventType: ProcessingEvent.VALIDATION_COMPLETED,
            milestone: "validatedAt",
            safeDetails: args.safeDetails,
            step: "validated",
            toState: ProcessingState.VALIDATED,
        });
    },
});

export const markSourceDisposed = mutation({
    args: {
        jobId: v.id("statementJobs"),
        submissionId: v.id("statementSubmissions"),
    },
    handler: async (ctx, args) => {
        await advanceJob(ctx, args, {
            eventType: ProcessingEvent.SOURCE_DISPOSED,
            milestone: "sourceDisposedAt",
            safeDetails: { sourceDurableArtifactCount: 0 },
            step: "source_disposed",
            toState: ProcessingState.SOURCE_DISPOSED,
        });
        await ctx.db.insert("statementAuditEvents", {
            correlationId: await getSubmissionCorrelationId(
                ctx,
                args.submissionId
            ),
            createdAt: Date.now(),
            jobId: args.jobId,
            kind: "source_disposed",
            submissionId: args.submissionId,
            uploadId: args.submissionId,
        });
    },
});

export const markReportReady = mutation({
    args: {
        checksum: v.string(),
        downloadName: v.string(),
        format: v.union(v.literal("json"), v.literal("pdf"), v.literal("xlsx")),
        jobId: v.id("statementJobs"),
        storageId: v.optional(v.string()),
        submissionId: v.id("statementSubmissions"),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("statementReports", {
            checksum: args.checksum,
            createdAt: Date.now(),
            downloadName: args.downloadName,
            format: args.format,
            storageId: args.storageId,
            submissionId: args.submissionId,
        });
        await advanceJob(ctx, args, {
            eventType: ProcessingEvent.REPORT_READY,
            milestone: "reportReadyAt",
            safeDetails: { format: args.format },
            step: "report_ready",
            toState: ProcessingState.REPORT_READY,
        });
    },
});

export const failJob = mutation({
    args: {
        failureCode: v.string(),
        failureMessageSafe: v.optional(v.string()),
        jobId: v.id("statementJobs"),
        submissionId: v.id("statementSubmissions"),
    },
    handler: async (ctx, args) => {
        const job = await getJob(ctx, args.jobId, args.submissionId);
        const now = Date.now();

        await ctx.db.patch(args.jobId, {
            currentStep: "failed",
            failedAt: now,
            failureCode: args.failureCode,
            failureMessageSafe: args.failureMessageSafe,
            state: ProcessingState.FAILED,
            updatedAt: now,
        });
        await ctx.db.patch(args.submissionId, {
            status: ProcessingState.FAILED,
            updatedAt: now,
        });
        await insertEvent(ctx, {
            eventType: ProcessingEvent.FAILED,
            fromState: job.state,
            jobId: args.jobId,
            safeDetails: { failureCode: args.failureCode },
            submissionId: args.submissionId,
            toState: ProcessingState.FAILED,
        });
    },
});

type AdvanceJobArgs = {
    readonly jobId: Id<"statementJobs">;
    readonly submissionId: Id<"statementSubmissions">;
};

type MilestoneField =
    | "extractionStartedAt"
    | "normalizedAt"
    | "reportReadyAt"
    | "sourceDisposedAt"
    | "validatedAt";

async function advanceJob(
    ctx: MutationCtx,
    args: AdvanceJobArgs,
    transition: {
        readonly eventType: ProcessingEvent;
        readonly milestone: MilestoneField;
        readonly safeDetails?: Record<string, string | number | boolean>;
        readonly step: string;
        readonly toState: ProcessingState;
    }
) {
    const job = await getJob(ctx, args.jobId, args.submissionId);

    assertProcessingStateTransition(job.state, transition.toState);

    const now = Date.now();
    await ctx.db.patch(args.jobId, {
        currentStep: transition.step,
        [transition.milestone]: now,
        state: transition.toState,
        updatedAt: now,
    });
    await ctx.db.patch(args.submissionId, {
        status: transition.toState,
        updatedAt: now,
    });
    await insertEvent(ctx, {
        eventType: transition.eventType,
        fromState: job.state,
        jobId: args.jobId,
        safeDetails: transition.safeDetails,
        submissionId: args.submissionId,
        toState: transition.toState,
    });
}

async function getJob(
    ctx: MutationCtx,
    jobId: Id<"statementJobs">,
    submissionId: Id<"statementSubmissions">
) {
    const job = await ctx.db.get(jobId);

    if (job === null || job.submissionId !== submissionId) {
        throw new Error("Statement processing job not found");
    }

    return job;
}

async function getSubmissionCorrelationId(
    ctx: MutationCtx,
    submissionId: Id<"statementSubmissions">
) {
    const submission = await ctx.db.get(submissionId);

    if (submission === null) {
        throw new Error("Statement submission not found");
    }

    return submission.correlationId;
}

async function insertEvent(
    ctx: MutationCtx,
    event: {
        readonly eventType: ProcessingEvent;
        readonly fromState?: Doc<"statementJobs">["state"];
        readonly jobId: Id<"statementJobs">;
        readonly safeDetails?: Record<string, string | number | boolean>;
        readonly submissionId: Id<"statementSubmissions">;
        readonly toState: ProcessingState;
    }
) {
    await ctx.db.insert("statementEvents", {
        ...event,
        createdAt: Date.now(),
    });
}
