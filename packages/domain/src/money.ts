export type CurrencyCode = "ZAR";

export type Money = {
    readonly amountMinor: number;
    readonly currency: CurrencyCode;
};

const decimalAmountPattern = /^-?\d+(?:\.\d{1,2})?$/;

export function createMoney(
    amountMinor: number,
    currency: CurrencyCode = "ZAR"
): Money {
    assertSafeMinorUnits(amountMinor);

    return Object.freeze({
        amountMinor,
        currency,
    });
}

export function parseDecimalMoney(
    amount: string,
    currency: CurrencyCode = "ZAR"
): Money {
    const normalized = amount.replaceAll(/\s|,/g, "");

    if (!decimalAmountPattern.test(normalized)) {
        throw new Error(`Invalid decimal money amount: ${amount}`);
    }

    const sign = normalized.startsWith("-") ? -1 : 1;
    const unsigned = sign === -1 ? normalized.slice(1) : normalized;
    const [major = "0", fraction = ""] = unsigned.split(".");
    const cents = fraction.padEnd(2, "0");
    const amountMinor =
        sign * (Number.parseInt(major, 10) * 100 + Number.parseInt(cents, 10));

    return createMoney(amountMinor, currency);
}

export function addMoney(left: Money, right: Money): Money {
    assertSameCurrency(left, right);

    return createMoney(left.amountMinor + right.amountMinor, left.currency);
}

export function subtractMoney(left: Money, right: Money): Money {
    assertSameCurrency(left, right);

    return createMoney(left.amountMinor - right.amountMinor, left.currency);
}

function assertSafeMinorUnits(amountMinor: number) {
    if (!Number.isSafeInteger(amountMinor)) {
        throw new Error("Money amount must be a safe integer minor-unit value");
    }
}

function assertSameCurrency(left: Money, right: Money) {
    if (left.currency !== right.currency) {
        throw new Error(
            `Currency mismatch: ${left.currency} cannot be combined with ${right.currency}`
        );
    }
}
