import { afterEach, describe, expect, it, vi } from "vitest";
import { accountDetails, mockData } from "@/data/mock";
import { sendCoachMessage, getAccountDetails } from "@/data/api";
import { getAccountsSummary } from "@/data/api";

afterEach(() => vi.useRealTimers());

describe("Accounts demo", () => {
  it("sums only financial assets and debt payments from the existing accounts", () => {
    expect(getAccountsSummary("inst_pnc", [{ id: "inst_pnc" }])).toEqual({ totalAssets: 68725.87, totalDebts: 334551.41, totalMonthlyDebtPayments: 3119.04 });
  });
  it("matches all seven accounts by type with 12 supplied monthly balances", () => {
    const accounts = getAccountDetails();
    expect(accounts).toHaveLength(7);
    for (const account of accounts) {
      expect(account.history).toEqual(accountDetails.find((item) => item.type === account.type)?.history);
      expect(account.chart).toHaveLength(12);
      expect(account.chart[0]?.month).toBe("2025-11");
      expect(account.chart[11]?.month).toBe("2026-10");
    }
    expect(accounts[0]?.history).toEqual([7274,6600,6056,5004,6164,7028,6270,6113,6380,6560,5512,6123]);
  });
  it("shows credit purchases and interest as money out and payments as money in", () => {
    const credit = getAccountDetails().find((account) => account.type === "credit_card");
    expect(credit?.activity[0]).toMatchObject({ incoming: false, displayAmount: "−$311.78", displayLabel: "Dining" });
    expect(credit?.activity[2]).toMatchObject({ incoming: false, displayAmount: "−$186.81" });
    expect(credit?.activity[3]).toMatchObject({ incoming: true, displayAmount: "+$1,425.62", displayLabel: "Payment received" });
  });
  it("shows asset withdrawals as money out and deposits as money in", () => {
    const accounts = getAccountDetails();
    expect(accounts.find((a) => a.type === "checking")?.activity[0]).toMatchObject({ incoming: false, displayAmount: "−$2,062.96" });
    expect(accounts.find((a) => a.type === "savings")?.activity[0]).toMatchObject({ incoming: true, displayAmount: "+$25.05" });
  });
  it("treats falling debts as good and the rising 187% credit balance as risk", () => {
    const accounts = getAccountDetails();
    expect(accounts.find((a) => a.type === "auto_loan")).toMatchObject({ changeTone: "good", change12m: -1657 });
    expect(accounts.find((a) => a.type === "credit_card")).toMatchObject({ changeTone: "bad", change12m: 91, utilization: 1.87, usageWidth: "93.5%", limitWidth: "50%" });
  });
  it.each([
    ["credit_card", 53, 5823], ["auto_loan", 57, 5569], ["personal_loan", 44, 3046], ["mortgage", 332, 325707],
  ])("retains the exact supplied %s payoff estimate", (type, months, interest) => {
    expect(getAccountDetails().find((a) => a.type === type)?.payoff).toMatchObject({ months, totalInterest: interest });
  });
  it("answers the account handoff with the corresponding supplied financial data", async () => {
    vi.useFakeTimers();
    const promise = sendCoachMessage("Tell me about my Auto loan", []);
    await vi.advanceTimersByTimeAsync(1200);
    const reply = await promise;
    expect(reply.verified).toBe(true);
    expect(reply.reply).toContain("$28,908");
    expect(reply.reply).toContain("7.5% APR");
    expect(reply.reply).toContain("57 months");
    expect(reply.sources).toEqual(["Auto loan account", "12-month account history"]);
  });
});