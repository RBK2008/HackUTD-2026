import type { Alert } from "./types";

export const demoEvents = [
  { type: "medical_bill", label: "Medical bill" },
  { type: "job_loss", label: "Job loss" },
  { type: "rate_increase", label: "Card rate increase" },
] as const;

export function createDemoAlert(eventType: string, today: string): Alert {
  const base = { id: `demo-${eventType}`, date: today, channels: ["app", "imessage"] as ("app" | "imessage")[], isDemo: true, read: false };
  switch (eventType) {
    case "medical_bill": return { ...base, severity: "critical", title: "Large medical bill paid", reason: "A $3,000 payment left checking and savings at $15,700.", suggestedAction: "Your emergency fund now covers about 1.9 months. Pause extra spending until it is rebuilt.", metricId: "emergency_fund" };
    case "job_loss": return { ...base, severity: "critical", title: "Paycheck didn't arrive", reason: "No payroll deposit this month. Your usual pay is about $8,440.", suggestedAction: "Your checking and savings would cover about 2.2 months of spending and debt costs. Ask the coach which payments to prioritize.", metricId: "emergency_fund" };
    case "rate_increase": return { ...base, severity: "warning", title: "Card interest rate went up", reason: "Your card APR rose from 22.5% to 27.5%.", suggestedAction: "That adds about $42 a month in interest on your current balance. Paying the card down first saves the most.", metricId: "credit_utilization" };
    default: throw new Error("Unknown demo event");
  }
}