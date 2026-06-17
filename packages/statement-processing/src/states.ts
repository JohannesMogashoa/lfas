export const ProcessingState = {
    INTAKE_RECEIVED: "intake_received",
    EXTRACTING: "extracting",
    NORMALIZED: "normalized",
    VALIDATED: "validated",
    SOURCE_DISPOSED: "source_disposed",
    REPORT_READY: "report_ready",
    FAILED: "failed",
} as const;

export type ProcessingState =
    (typeof ProcessingState)[keyof typeof ProcessingState];

export const ProcessingEvent = {
    INTAKE_ACCEPTED: "intake_accepted",
    EXTRACTION_STARTED: "extraction_started",
    NORMALIZATION_COMPLETED: "normalization_completed",
    VALIDATION_COMPLETED: "validation_completed",
    SOURCE_DISPOSED: "source_disposed",
    REPORT_READY: "report_ready",
    FAILED: "failed",
} as const;

export type ProcessingEvent =
    (typeof ProcessingEvent)[keyof typeof ProcessingEvent];

const allowedTransitions = {
    [ProcessingState.INTAKE_RECEIVED]: [
        ProcessingState.EXTRACTING,
        ProcessingState.FAILED,
    ],
    [ProcessingState.EXTRACTING]: [
        ProcessingState.NORMALIZED,
        ProcessingState.FAILED,
    ],
    [ProcessingState.NORMALIZED]: [
        ProcessingState.VALIDATED,
        ProcessingState.FAILED,
    ],
    [ProcessingState.VALIDATED]: [
        ProcessingState.SOURCE_DISPOSED,
        ProcessingState.FAILED,
    ],
    [ProcessingState.SOURCE_DISPOSED]: [
        ProcessingState.REPORT_READY,
        ProcessingState.FAILED,
    ],
    [ProcessingState.REPORT_READY]: [],
    [ProcessingState.FAILED]: [],
} as const satisfies Record<ProcessingState, readonly ProcessingState[]>;

export function canTransitionProcessingState(
    from: ProcessingState,
    to: ProcessingState
) {
    const nextStates: readonly ProcessingState[] = allowedTransitions[from];

    return nextStates.includes(to);
}

export function assertProcessingStateTransition(
    from: ProcessingState,
    to: ProcessingState
) {
    if (!canTransitionProcessingState(from, to)) {
        throw new Error(`Invalid processing transition: ${from} -> ${to}`);
    }
}
