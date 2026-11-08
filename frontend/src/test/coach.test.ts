import { afterEach, describe, expect, it, vi } from "vitest";
import { sendCoachMessage } from "@/data/api";
import { getSteadyCatalogSnapshot } from "@/data/steady-catalog";
import { sessionStore } from "@/data/session";

vi.mock("@/data/steady-catalog", () => ({
  getSteadyCatalogSnapshot: vi.fn(),
}));

const snapshot = vi.mocked(getSteadyCatalogSnapshot);
const data = {
  profile: { customerId: "C012" },
  accounts: [{ customerId: "C012", accountType: "checking", balanceCents: 524198n }],
  alerts: [{ customerId: "C012", id: "card-rise", month: "2026-10", increaseCents: 500n }],
} as NonNullable<ReturnType<typeof getSteadyCatalogSnapshot>["data"]>;

afterEach(() => sessionStore.signOut());

describe("Coach cloud context", () => {
  it("answers account and alert questions using the active customer's cloud snapshot", async () => {
    sessionStore.selectCustomer("C012");
    snapshot.mockReturnValue({ data, error: null });
    expect(await sendCoachMessage("Tell me about my checking", [])).toMatchObject({
      reply: "The balance for Checking is $5,241.98.",
      verified: true,
    });
    expect(await sendCoachMessage("Explain this alert", [], { alertId: "card-rise" })).toMatchObject({
      verified: true,
      sources: ["SpacetimeDB · PNC alerts"],
    });
  });

  it("withholds another customer's figures and unsupported replies", async () => {
    snapshot.mockReturnValue({ data, error: null });
    sessionStore.selectCustomer("C024");
    expect(await sendCoachMessage("Tell me about my checking", [])).toMatchObject({ sources: [], verified: false });
    sessionStore.selectCustomer("C012");
    expect(await sendCoachMessage("Unknown question", [])).toMatchObject({ sources: [], verified: false });
  });
});
