const decimalAmountPattern = /^-?\d+(?:\.\d{1,2})?$/;

export function parseDecimalAmountToMinorUnits(amount: string) {
    const normalized = amount.replaceAll(/\s|,/g, "");

    if (!decimalAmountPattern.test(normalized)) {
        throw new Error(`Invalid decimal money amount: ${amount}`);
    }

    const sign = normalized.startsWith("-") ? -1 : 1;
    const unsigned = sign === -1 ? normalized.slice(1) : normalized;
    const [major = "0", fraction = ""] = unsigned.split(".");
    const cents = fraction.padEnd(2, "0");

    return (
        sign * (Number.parseInt(major, 10) * 100 + Number.parseInt(cents, 10))
    );
}
