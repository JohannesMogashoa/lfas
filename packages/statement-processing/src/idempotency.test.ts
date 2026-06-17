import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createIdempotencyKey, createSourceFingerprint } from "./index.ts";

describe("statement source idempotency", () => {
    it("uses a keyed fingerprint instead of raw source content", () => {
        const bytes = new TextEncoder().encode("raw pdf bytes").buffer;
        const secret = "test-fingerprint-secret";

        const first = createSourceFingerprint(bytes, secret);
        const second = createSourceFingerprint(bytes, secret);
        const key = createIdempotencyKey(first, "anonymous");

        assert.equal(first, second);
        assert.equal(first.length, 64);
        assert.equal(key.length, 64);
        assert.equal(first.includes("raw pdf bytes"), false);
    });
});
