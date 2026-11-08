import { describe, expect, it } from "vitest";
import { alertsReducer } from "@/data/alertsStore";
import { createDemoAlert } from "./fixtures/demoAlerts";
import { mockData } from "./fixtures/mock";
import { filterAlerts, groupAlerts } from "@/lib/alerts";

const initial = () => ({ alerts: mockData.alerts, usedDemoIds: [] as string[] });
describe("Shared alerts", () => {
  it("mark read decreases unread from four to three", () => {
    const state = alertsReducer(initial(), { type: "read", id: "a1" });
    expect(filterAlerts(state.alerts, "Unread")).toHaveLength(3);
    expect(state.alerts.find((alert) => alert.id === "a1")?.read).toBe(true);
  });
  it("mark all read leaves no unread alerts without removing alerts", () => {
    const state = alertsReducer(initial(), { type: "readAll" });
    expect(filterAlerts(state.alerts, "Unread")).toHaveLength(0);
    expect(state.alerts).toHaveLength(5);
  });
  it("dismiss removes only the selected alert", () => {
    expect(alertsReducer(initial(), { type: "dismiss", id: "a1" }).alerts.map((alert) => alert.id)).toEqual(["a2", "a3", "a4", "a5"]);
  });
  it("adds demos once, including after dismissal, until reset", () => {
    const alert = createDemoAlert("medical_bill", "2026-11-08");
    const added = alertsReducer(initial(), { type: "add", alert });
    expect(added.alerts[0]).toEqual(alert);
    expect(filterAlerts(added.alerts, "Unread")).toHaveLength(5);
    const dismissed = alertsReducer(added, { type: "dismiss", id: alert.id });
    expect(alertsReducer(dismissed, { type: "add", alert }).alerts).toHaveLength(5);
    const reset = alertsReducer(added, { type: "resetDemo" });
    expect(reset.alerts).toEqual(mockData.alerts);
    expect(reset.usedDemoIds).toEqual([]);
    expect(alertsReducer(reset, { type: "add", alert }).alerts).toHaveLength(6);
  });
  it("groups by actual date and sorts newest first", () => {
    const today = createDemoAlert("job_loss", "2026-11-08");
    const month = { ...today, id: "month", date: "2026-11-02" };
    expect(groupAlerts([...mockData.alerts, month, today], "2026-11-08").map((group) => [group.label, group.alerts.map((alert) => alert.id)])).toEqual([["Today", ["demo-job_loss"]], ["This month", ["month"]], ["Earlier", ["a1", "a2", "a3", "a4", "a5"]]]);
  });
  it("keeps existing alert metric and delivery assignments", () => {
    expect(mockData.alerts.slice(0, 2).map((alert) => [alert.metricId, alert.channels])).toEqual([["credit_utilization", ["app", "imessage"]], ["credit_utilization", ["app", "imessage"]]]);
    expect(mockData.alerts[2]?.metricId).toBe("emergency_fund");
    expect(mockData.alerts[2]?.channels).toEqual(["app"]);
  });
});
describe("Demo events", () => {
  it.each([
    ["medical_bill", "critical", "$3,000", "$15,700", "1.9 months", "emergency_fund"],
    ["job_loss", "critical", "$8,440", "No payroll", "2.2 months", "emergency_fund"],
    ["rate_increase", "warning", "22.5%", "27.5%", "$42", "credit_utilization"],
  ])("returns %s with the specified financial amounts", (type, severity, amount, other, action, metricId) => {
    const alert = createDemoAlert(type, "2026-11-08");
    expect(alert.reason).toContain(amount);
    expect(alert.reason).toContain(other);
    expect(alert.suggestedAction).toContain(action);
    expect(alert).toMatchObject({ severity, metricId, date: "2026-11-08", channels: ["app", "imessage"], read: false, isDemo: true });
  });
});
