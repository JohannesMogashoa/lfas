export {
    assertProcessingStateTransition,
    canTransitionProcessingState,
    ProcessingEvent,
    ProcessingState,
} from "./states.ts";
export {
    createIdempotencyKey,
    createSourceFingerprint,
} from "./idempotency.ts";
export { parseDecimalAmountToMinorUnits } from "./money.ts";
export { normalizeParsedTransactions } from "./normalization.ts";
export {
    createDuplicateTransactionFingerprint,
    createValidationReport,
    detectDuplicateTransactions,
    detectTransactionGaps,
    validateBoundaryBalances,
    validateRunningBalances,
    validateStatement,
} from "./validation.ts";
export type {
    CanonicalTransaction,
    CurrencyCode,
    Money,
    TransactionDirection,
} from "@lfas/domain";
export type {
    NormalizedStatementTransaction,
    ParserTransactionLike,
    ProcessingEventRecord,
    ReportDescriptor,
    StatementSubmissionMetadata,
} from "./types.ts";
export type {
    StatementValidationInput,
    ValidationCode,
    ValidationFinding,
    ValidationReport,
    ValidationReportSummary,
    ValidationSeverity,
} from "./validation.ts";
