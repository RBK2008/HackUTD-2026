import { afterEach, describe, expect, it, vi } from "vitest";
import { accountsStore } from "@/data/accountsStore";
import { demoCustomers } from "./fixtures/customerFixtures";
import { mockData } from "./fixtures/mock";
import { sessionStore } from "@/data/session";
import { formatUsPhone, phoneDigits, toPhoneE164 } from "@/lib/settings";

afterEach(() => { vi.useRealTimers(); sessionStore.signOut(); });

describe("Corrected customer fixtures", () => {
  it("provides all 30 selectable customers with the specified health counts", () => {
    expect(demoCustomers).toHaveLength(30);
    expect(demoCustomers[0]).toMatchObject({ id: "C001", name: "Demo Customer 01 (C001)", health: { good: 2, watch: 2, risk: 0 } });
    expect(demoCustomers[1]?.health).toEqual({ good: 4, watch: 0, risk: 0 });
    expect(demoCustomers[23]).toMatchObject({ id: "C024", health: { good: 0, watch: 2, risk: 2 } });
    expect(demoCustomers[29]?.name).toBe("Demo Customer 30 (C030)");
  });
  it("uses the supplied debt costs without double-counted card payments", () => {
    expect(mockData.monthly.map((month) => month.debtCosts)).toEqual([2797, 2806, 2742, 2662, 2847, 2758, 2881, 2684, 2657, 2610, 2875, 2773]);
    expect(mockData.metrics.map((metric) => metric.value)).toEqual([2.2, 0.37, 1.87, 71]);
  });
});

describe("Session and bank settings", () => {
  it("persists only session and connected-item metadata, never credentials or tokens", () => {
    sessionStore.selectCustomer("C007");
    sessionStore.completeConnection({ itemId: "item-mock-safe", institutionName: "Tartan Bank", connectedAt: "2026-11-08T06:00:00Z" });
    const saved = localStorage.getItem("steady-demo-session-v1") ?? "";
    expect(JSON.parse(saved)).toMatchObject({ mode: "demo", selectedCustomerId: "C007", connectedItems: [{ itemId: "item-mock-safe", institutionName: "Tartan Bank" }] });
    expect(saved).not.toContain("user_good");
    expect(saved).not.toContain("pass_good");
    expect(saved).not.toContain("public-sandbox");
    expect(saved).not.toContain("link-sandbox");
  });
  it("keeps a live account nickname until reset", () => {
    accountsStore.renameAccount("A-C012-CHECKING", "Everyday checking");
    expect(accountsStore.getSnapshot().nicknames["A-C012-CHECKING"]).toBe("Everyday checking");
    accountsStore.reset();
    expect(accountsStore.getSnapshot().nicknames).toEqual({});
  });
});

describe("US phone settings", () => {
  it("formats as the user types and stores exactly ten digits as E.164", () => {
    expect(phoneDigits("555-123-4567 ext 9")).toBe("5551234567");
    expect(formatUsPhone("5551234")).toBe("(555) 123-4");
    expect(formatUsPhone("5551234567")).toBe("(555) 123-4567");
    expect(toPhoneE164("(555) 123-4567")).toBe("+15551234567");
    expect(toPhoneE164("555")).toBe("");
  });
});
