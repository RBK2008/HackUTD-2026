import type { Alert } from "@/data/types";

export type AlertFilter = "All" | "Unread" | "Critical" | "Warning" | "Info";
export const alertFilters: AlertFilter[] = ["All", "Unread", "Critical", "Warning", "Info"];
export function filterAlerts(alerts: Alert[], filter: AlertFilter) {
  return alerts.filter((alert) => filter === "All" || (filter === "Unread" ? !alert.read : alert.severity === filter.toLowerCase()));
}
export function groupAlerts(alerts: Alert[], today: string) {
  return ["Today", "This month", "Earlier"].map((label) => ({ label, alerts: alerts.filter((alert) => {
    const group = alert.date === today ? "Today" : alert.date.slice(0, 7) === today.slice(0, 7) ? "This month" : "Earlier";
    return group === label;
  }) })).filter((group) => group.alerts.length > 0);
}