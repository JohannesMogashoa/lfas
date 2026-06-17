import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const bank = v.union(
    v.literal("investec"),
    v.literal("absa"),
    v.literal("fnb"),
    v.literal("capitec")
);

const processingState = v.union(
    v.literal("intake_received"),
    v.literal("extracting"),
    v.literal("normalized"),
    v.literal("validated"),
    v.literal("source_disposed"),
    v.literal("report_ready"),
    v.literal("failed")
);

const processingEvent = v.union(
    v.literal("intake_accepted"),
    v.literal("extraction_started"),
    v.literal("normalization_completed"),
    v.literal("validation_completed"),
    v.literal("source_disposed"),
    v.literal("report_ready"),
    v.literal("failed")
);

const safeDetails = v.record(
    v.string(),
    v.union(v.string(), v.number(), v.boolean())
);

export default defineSchema({
    statementSubmissions: defineTable({
        bankHint: v.optional(bank),
        byteSize: v.number(),
        correlationId: v.string(),
        createdAt: v.number(),
        currentJobId: v.optional(v.id("statementJobs")),
        idempotencyKey: v.string(),
        mimeType: v.string(),
        sourceFingerprint: v.string(),
        status: processingState,
        updatedAt: v.number(),
        userId: v.string(),
    })
        .index("by_user_idempotency", ["userId", "idempotencyKey"])
        .index("by_correlation_id", ["correlationId"])
        .index("by_status_created_at", ["status", "createdAt"]),

    statementJobs: defineTable({
        attempt: v.number(),
        createdAt: v.number(),
        currentStep: v.string(),
        extractionStartedAt: v.optional(v.number()),
        failedAt: v.optional(v.number()),
        failureCode: v.optional(v.string()),
        failureMessageSafe: v.optional(v.string()),
        intakeReceivedAt: v.number(),
        normalizedAt: v.optional(v.number()),
        reportReadyAt: v.optional(v.number()),
        sourceDisposedAt: v.optional(v.number()),
        state: processingState,
        submissionId: v.id("statementSubmissions"),
        updatedAt: v.number(),
        validatedAt: v.optional(v.number()),
    })
        .index("by_submission_id", ["submissionId"])
        .index("by_state_created_at", ["state", "createdAt"]),

    statementEvents: defineTable({
        createdAt: v.number(),
        eventType: processingEvent,
        fromState: v.optional(processingState),
        jobId: v.id("statementJobs"),
        safeDetails: v.optional(safeDetails),
        submissionId: v.id("statementSubmissions"),
        toState: processingState,
    })
        .index("by_job_id", ["jobId"])
        .index("by_submission_id", ["submissionId"]),

    statementTransactions: defineTable({
        amountMinor: v.number(),
        balanceMinor: v.optional(v.number()),
        bank,
        createdAt: v.number(),
        currency: v.literal("ZAR"),
        date: v.string(),
        description: v.string(),
        direction: v.union(v.literal("debit"), v.literal("credit")),
        sourceLineNumber: v.number(),
        submissionId: v.id("statementSubmissions"),
    }).index("by_submission_id", ["submissionId"]),

    statementReports: defineTable({
        checksum: v.string(),
        createdAt: v.number(),
        downloadName: v.string(),
        format: v.union(v.literal("json"), v.literal("pdf"), v.literal("xlsx")),
        storageId: v.optional(v.string()),
        submissionId: v.id("statementSubmissions"),
    }).index("by_submission_id", ["submissionId"]),

    statementAuditEvents: defineTable({
        correlationId: v.string(),
        createdAt: v.number(),
        jobId: v.optional(v.id("statementJobs")),
        kind: v.string(),
        sourceIpAddress: v.optional(v.string()),
        submissionId: v.id("statementSubmissions"),
        uploadId: v.string(),
        uploadedByUserId: v.optional(v.string()),
    })
        .index("by_submission_id", ["submissionId"])
        .index("by_correlation_id", ["correlationId"]),
});
