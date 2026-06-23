import assert from "node:assert/strict";
import test from "node:test";

import { extractPdfTextLines } from "../pdf.ts";
import parseInvestecStatement from "./investec.ts";

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

test("extracts text lines from PDF bytes in reading order", async () => {
    const bytes = createTextPdf([
        "1Mar2025 28Feb2025 GoogleYouTubePremiumLondonGB 71.99",
        "PremiumFamilyPlan",
        "2Mar2025 1Mar2025 NextTransaction 10.00",
    ]);

    const lines = await extractPdfTextLines(bytes);

    assert.deepEqual(lines, [
        "1Mar2025 28Feb2025 GoogleYouTubePremiumLondonGB 71.99",
        "PremiumFamilyPlan",
        "2Mar2025 1Mar2025 NextTransaction 10.00",
    ]);
});

test("parses Investec transactions directly from PDF bytes", async () => {
    const bytes = createTextPdf([
        "1Mar2025 28Feb2025 GoogleYouTubePremiumLondonGB 71.99",
        "PremiumFamilyPlan",
        "2Mar2025 1Mar2025 NextTransaction 10.00",
    ]);

    const result = await parseInvestecStatement(bytes);

    assert.equal(result.warnings.length, 0);
    assert.equal(result.transactions.length, 2);
    assert.equal(
        result.transactions[0]?.transactionDescription,
        "GoogleYouTubePremiumLondonGB PremiumFamilyPlan"
    );
    assert.equal(result.transactions[0]?.date, "2025-03-01");
    assert.equal(
        result.transactions[1]?.transactionDescription,
        "NextTransaction"
    );
});
