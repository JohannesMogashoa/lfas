import { createHmac } from "node:crypto";

export function createSourceFingerprint(bytes: ArrayBuffer, secret: string) {
    if (secret.trim().length < 16) {
        throw new Error("Statement fingerprint secret is too short");
    }

    return createHmac("sha256", secret)
        .update(Buffer.from(bytes))
        .digest("hex");
}

export function createIdempotencyKey(
    sourceFingerprint: string,
    userScope: string
) {
    return createHmac("sha256", sourceFingerprint)
        .update(userScope)
        .digest("hex");
}
