import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    assertProcessingStateTransition,
    canTransitionProcessingState,
    ProcessingState,
} from "./index.ts";

describe("processing state machine", () => {
    it("allows the source-free happy path", () => {
        assert.equal(
            canTransitionProcessingState(
                ProcessingState.INTAKE_RECEIVED,
                ProcessingState.EXTRACTING
            ),
            true
        );
        assert.equal(
            canTransitionProcessingState(
                ProcessingState.VALIDATED,
                ProcessingState.SOURCE_DISPOSED
            ),
            true
        );
        assert.equal(
            canTransitionProcessingState(
                ProcessingState.SOURCE_DISPOSED,
                ProcessingState.REPORT_READY
            ),
            true
        );
    });

    it("prevents report readiness before source disposal", () => {
        assert.equal(
            canTransitionProcessingState(
                ProcessingState.VALIDATED,
                ProcessingState.REPORT_READY
            ),
            false
        );
        assert.throws(() =>
            assertProcessingStateTransition(
                ProcessingState.VALIDATED,
                ProcessingState.REPORT_READY
            )
        );
    });
});
