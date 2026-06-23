import assert from "node:assert/strict";
import test from "node:test";

import {
    detectBankFromTextLines,
    parseDetectedBankStatementPdf,
} from "./detection.ts";
import { Bank } from "./types.ts";

function createTextPdf(lines: readonly string[]): ArrayBuffer {
    const escapedLines = lines.map(escapePdfString);

    const content = ["BT", "/F1 12 Tf", "14 TL", "72 720 Td"];

    escapedLines.forEach((line, index) => {
        content.push(`(${line}) Tj`);

        if (index !== escapedLines.length - 1) {
            content.push("T*");
        }
    });

    content.push("ET");

    const stream = content.join("\n");
    const objects = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
        "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
        `5 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`,
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = ["0000000000 65535 f \n"];

    for (const object of objects) {
        offsets.push(
            `${String(Buffer.byteLength(pdf)).padStart(10, "0")} 00000 n \n`
        );
        pdf += object;
    }

    const xrefStart = Buffer.byteLength(pdf);
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += offsets.join("");
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new TextEncoder().encode(pdf).buffer;
}

function escapePdfString(value: string) {
    return value
        .replaceAll("\\", "\\\\")
        .replaceAll("(", "\\(")
        .replaceAll(")", "\\)");
}

test("detects Investec with high certainty from exact statement signals", () => {
    const detection = detectBankFromTextLines([
        "Investec Specialist Bank",
        "Private Bank Account Statement",
    ]);

    assert.deepEqual(detection, {
        bank: Bank.INVESTEC,
        certainty: "high",
        implementationStatus: "implemented",
        matchedSignals: [
            "investec-specialist-bank-header",
            "investec-private-bank-account-statement",
        ],
        status: "detected",
    });
});

test("detects placeholder banks from distinctive synthetic headers", () => {
    const examples = [
        {
            bank: Bank.ABSA,
            line: "ABSA Bank Limited",
            signal: "absa-bank-name",
        },
        {
            bank: Bank.FNB,
            line: "First National Bank Cheque Account Statement",
            signal: "fnb-first-national-bank",
        },
        {
            bank: Bank.CAPITEC,
            line: "Capitec Bank Limited Statement",
            signal: "capitec-bank-name",
        },
        {
            bank: Bank.STANDARD_BANK,
            line: "Standard Bank of South Africa Account Statement",
            signal: "standard-bank-name",
        },
        {
            bank: Bank.NEDBANK,
            line: "Nedbank Limited Current Account Statement",
            signal: "nedbank-bank-name",
        },
    ] as const;

    for (const example of examples) {
        const detection = detectBankFromTextLines([example.line]);

        assert.equal(detection.status, "detected");
        assert.equal(detection.bank, example.bank);
        assert.equal(detection.implementationStatus, "placeholder");
        assert.equal(detection.certainty, "high");
        assert.ok(detection.matchedSignals.includes(example.signal));
    }
});

test("falls back for unknown or empty input", () => {
    assert.equal(detectBankFromTextLines([]).status, "unknown");
    assert.equal(detectBankFromTextLines(["   "]).status, "unknown");
    assert.equal(
        detectBankFromTextLines(["Monthly Account Statement"]).status,
        "unknown"
    );
});

test("falls back instead of guessing when bank signals conflict", () => {
    const detection = detectBankFromTextLines(["ABSA", "FNB"]);

    assert.deepEqual(detection, {
        bank: null,
        certainty: "none",
        fallbackReason: "Conflicting bank detection signals were found.",
        matchedSignals: [],
        status: "unknown",
    });
});

test("routes detected Investec PDFs to the implemented parser", async () => {
    const bytes = createTextPdf([
        "Investec Specialist Bank",
        "Private Bank Account Statement",
        "1Mar2025 28Feb2025 GoogleYouTubePremiumLondonGB 71.99",
    ]);

    const result = await parseDetectedBankStatementPdf(bytes);

    assert.equal(result.detection.status, "detected");
    assert.equal(result.detection.bank, Bank.INVESTEC);
    assert.equal(result.transactions.length, 1);
    assert.equal(result.warnings.length, 0);
});

test("routes detected placeholder bank PDFs to unsupported parser stubs", async () => {
    const bytes = createTextPdf(["Standard Bank of South Africa Statement"]);

    const result = await parseDetectedBankStatementPdf(bytes);

    assert.equal(result.detection.status, "detected");
    assert.equal(result.detection.bank, Bank.STANDARD_BANK);
    assert.deepEqual(result.transactions, []);
    assert.deepEqual(result.warnings, [
        "Standard Bank statement parsing is not implemented yet.",
    ]);
});

test("does not route unknown PDFs to a bank parser", async () => {
    const bytes = createTextPdf(["Generic Monthly Statement"]);

    const result = await parseDetectedBankStatementPdf(bytes);

    assert.deepEqual(result.detection, {
        bank: null,
        certainty: "none",
        fallbackReason: "No supported bank detection signals were found.",
        matchedSignals: [],
        status: "unknown",
    });
    assert.deepEqual(result.transactions, []);
    assert.deepEqual(result.warnings, [
        "Statement bank could not be identified from supported detection signals.",
    ]);
});
