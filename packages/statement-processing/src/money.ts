import { parseDecimalMoney } from "@lfas/domain";

export function parseDecimalAmountToMinorUnits(amount: string) {
    return parseDecimalMoney(amount).amountMinor;
}
