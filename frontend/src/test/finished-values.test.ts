import { expect, it } from "vitest";
import { mockData, accountDetails } from "./fixtures/mock";
import { platypusAccounts, platypusDetails } from "./fixtures/bankFixtures";

it("receives every supplied change and tone rather than deriving them from history", () => {
  expect([...mockData.accounts, ...platypusAccounts].map((account) => [account.id, account.change12m, account.changeTone])).toEqual([
    ["acct_pnc_checking", -1151, "neutral"], ["acct_pnc_savings", 623, "good"], ["acct_pnc_ira", 3170, "good"],
    ["acct_pnc_card", 91, "bad"], ["acct_pnc_auto", -1657, "good"], ["acct_pnc_personal", -996, "good"],
    ["acct_pnc_mortgage", -5087, "good"], ["acct_plat_savings", 1086, "good"], ["acct_plat_card", 61, "bad"],
  ]);
});
it("receives PNC utilization and over-limit flag", () => {
  expect(mockData.accounts.find((account) => account.id === "acct_pnc_card")).toMatchObject({ utilization: 1.87, overLimit: true });
});
it("receives Platypus utilization and over-limit flag", () => {
  expect(platypusAccounts.find((account) => account.id === "acct_plat_card")).toMatchObject({ utilization: 0.66, overLimit: false });
});
it("receives payoff years exactly as supplied", () => {
  expect([...accountDetails, ...platypusDetails].filter((account) => account.payoff).map((account) => account.payoff?.years)).toEqual([4.4, 4.8, 3.7, 27.7, 4.4]);
});
it("receives category amounts in the supplied order", () => {
  expect(mockData.spendingByCategoryLastMonth.map((category) => [category.category, category.amount])).toEqual([
    ["housing", 1990], ["groceries", 975], ["utilities", 884], ["other_spending", 884], ["dining", 312], ["shopping", 312], ["transport", 312],
  ]);
});