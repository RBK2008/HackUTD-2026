import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendCoachMessage } from "@/data/api";

describe("Coach demo replies", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  async function replyTo(message: string, context?: { alertId?: string }) {
    const promise = sendCoachMessage(message, [], context);
    await vi.advanceTimersByTimeAsync(1200);
    return promise;
  }
  it("waits 1.2 seconds before returning", async () => {
    let settled = false;
    const promise = sendCoachMessage("hello", []).then(() => { settled = true; });
    await vi.advanceTimersByTimeAsync(1199);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await promise;
    expect(settled).toBe(true);
  });
  it("matches credit questions case-insensitively with the specified values", async () => {
    const reply = await replyTo("Why is my CREDIT USE RED?");
    expect(reply.reply).toContain("$9,971 and your limit is $5,332");
    expect(reply.reply).toContain("187%");
    expect(reply.sources).toEqual(["Credit card use metric", "Monthly card balances"]);
    expect(reply.verified).toBe(true);
  });
  it("returns October spending and category amounts", async () => {
    const reply = await replyTo("Where did my money go last month?");
    expect(reply.reply).toContain("$5,669");
    expect(reply.reply).toContain("housing ($1,990), groceries ($975), utilities ($884), and other spending ($884)");
    expect(reply.sources).toEqual(["Spending by category, October 2026"]);
  });
  it("returns debt income ratio and monthly payment amounts", async () => {
    const reply = await replyTo("How much of my income goes to debt?");
    expect(reply.reply).toContain("37%");
    expect(reply.reply).toContain("under 36%");
    expect(reply.reply).toContain("$1,832");
    expect(reply.reply).toContain("$602");
  });
  it.each(["$50", "50 more", "pay more"])("matches extra payment keyword %s", async (keyword) => {
    const reply = await replyTo(keyword);
    expect(reply.reply).toContain("22.5%");
    expect(reply.reply).toContain("Paying $50 more each month");
    expect(reply.reply).toContain("roughly $40 a month");
    expect(reply.sources).toEqual(["Credit card account", "Simulation: extra payment"]);
  });
  it("uses the context alert rather than matching spending keywords in its title", async () => {
    const reply = await replyTo("Explain this alert: spending", { alertId: "a1" });
    expect(reply.reply).toBe("Balance $9,971 vs. limit $5,332. Pay down the card before adding new purchases.");
    expect(reply.sources).toEqual(["Alerts"]);
    expect(reply.verified).toBe(true);
  });
  it("can resolve an alert title without context", async () => {
    const reply = await replyTo("Explain this alert: Card balance rose 12 months in a row");
    expect(reply.reply).toContain("Paying $50 more per month would start shrinking it.");
    expect(reply.sources).toEqual(["Alerts"]);
  });
  it("does not mark unknown questions or alerts as verified", async () => {
    expect(await replyTo("hello")).toMatchObject({ sources: [], verified: false });
    expect(await replyTo("Explain this alert: unknown", { alertId: "missing" })).toMatchObject({ sources: [], verified: false });
  });
});