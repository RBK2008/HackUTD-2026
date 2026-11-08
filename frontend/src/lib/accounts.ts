import type { Account, AccountDetail } from "@/data/types";
import { formatCurrency, formatMonths, formatNumber, formatRate, formatSignedCurrency } from "@/lib/format";

export function isDebt(account: Account) { return !["checking", "savings", "ira", "cd"].includes(account.type); }
/** Joins supplied fields and formats them for display; no financial calculations. */
export function accountPresentation(account: Account, detail: AccountDetail) {
  const debt = isDebt(account);
  return {
    ...account, ...detail, type: account.type, debt,
    changeLabel: account.changeMagnitude === undefined ? undefined : `${formatCurrency(account.changeMagnitude)} ${account.changeDirection} over 12 months`,
    rateLabel: debt ? `${formatRate(account.apr ?? 0)} APR · ${formatCurrency(account.monthlyPayment ?? 0)}/month` : account.yield ? `${formatRate(account.yield)} interest` : "No interest",
    payoffLabel: detail.payoff ? `${formatMonths(detail.payoff.months)} (about ${formatNumber(detail.payoff.years)} years) at your current payment, about ${formatCurrency(detail.payoff.totalInterest)} in interest.` : undefined,
    activity: detail.recent.map((item) => ({ ...item, displayAmount: formatSignedCurrency(item.displayValue) })),
  };
}
export type AccountView = ReturnType<typeof accountPresentation>;
