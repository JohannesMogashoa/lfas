import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    addMoney,
    createMoney,
    parseDecimalMoney,
    subtractMoney,
} from "./index.ts";
import type { Money } from "./index.ts";

describe("money", () => {
    it("creates immutable money from safe integer minor units", () => {
        const money = createMoney(12345, "ZAR");

        assert.deepEqual(money, {
            amountMinor: 12345,
            currency: "ZAR",
        });
        assert.equal(Object.isFrozen(money), true);
    });

    it("rejects unsafe minor-unit values", () => {
        assert.throws(
            () => createMoney(Number.MAX_SAFE_INTEGER + 1, "ZAR"),
            /safe integer/
        );
    });

    it("parses decimal money into integer minor units", () => {
        assert.deepEqual(parseDecimalMoney("1,234.50"), {
            amountMinor: 123450,
            currency: "ZAR",
        });
        assert.deepEqual(parseDecimalMoney("-20.5"), {
            amountMinor: -2050,
            currency: "ZAR",
        });
    });

    it("rejects unsupported decimal precision instead of rounding", () => {
        assert.throws(() => parseDecimalMoney("12.345"), /Invalid decimal/);
    });

    it("adds and subtracts matching currencies", () => {
        const left = createMoney(1500, "ZAR");
        const right = createMoney(250, "ZAR");

        assert.deepEqual(addMoney(left, right), {
            amountMinor: 1750,
            currency: "ZAR",
        });
        assert.deepEqual(subtractMoney(left, right), {
            amountMinor: 1250,
            currency: "ZAR",
        });
    });

    it("rejects currency mismatches", () => {
        const zar = createMoney(100, "ZAR");
        const usd = { amountMinor: 100, currency: "USD" } as unknown as Money;

        assert.throws(() => addMoney(zar, usd), /Currency mismatch/);
    });
});
