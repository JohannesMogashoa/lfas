import {
    extractTextItems,
    getDocumentProxy,
    type StructuredTextItem,
} from "unpdf";

const ROW_Y_TOLERANCE = 1.5;

export async function extractPdfTextLines(
    bytes: ArrayBuffer
): Promise<string[]> {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { items } = await extractTextItems(pdf);
    const lines = items.flatMap((pageItems) => extractLinesFromPage(pageItems));

    return lines;
}

function extractLinesFromPage(items: readonly StructuredTextItem[]): string[] {
    const rows: { items: StructuredTextItem[]; y: number }[] = [];

    for (const item of [...items].sort((left, right) => {
        if (right.y !== left.y) {
            return right.y - left.y;
        }

        return left.x - right.x;
    })) {
        if (!item.str.trim()) {
            continue;
        }

        const lastRow = rows.at(-1);

        if (!lastRow || Math.abs(lastRow.y - item.y) > ROW_Y_TOLERANCE) {
            rows.push({
                items: [item],
                y: item.y,
            });
            continue;
        }

        lastRow.items.push(item);
        lastRow.y = (lastRow.y + item.y) / 2;
    }

    return rows
        .map((row) =>
            row.items
                .sort((left, right) => left.x - right.x)
                .map((item) => item.str)
                .join(" ")
        )
        .map((line) => line.replace(/\s+/gu, " ").trim())
        .filter(Boolean);
}
