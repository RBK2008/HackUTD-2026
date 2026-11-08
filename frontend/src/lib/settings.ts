import type { AlertSettings, AlertTypeKey } from "@/data/types";

export const alertTypeOptions: { key: AlertTypeKey; label: string; description: string }[] = [
  { key: "overCreditLimit", label: "Over credit limit", description: "A card balance passes its credit limit." },
  { key: "highCardUse", label: "High card use", description: "Card use rises above a healthy share of the limit." },
  { key: "cardBalanceRising", label: "Card balance rising", description: "A card balance keeps growing month after month." },
  { key: "lowEmergencyFund", label: "Low emergency fund", description: "Your cash cushion falls below your goal." },
  { key: "highDebtPayments", label: "High debt payments", description: "Scheduled debt payments take a large share of income." },
  { key: "spendingOverIncome", label: "Spending more than you earn", description: "Spending and debt costs exceed monthly income." },
  { key: "feesCharged", label: "Fees charged", description: "A new account or servicing fee appears." },
  { key: "missingPaycheck", label: "Missing paycheck", description: "An expected payroll deposit does not arrive." },
  { key: "largeUnusualPayment", label: "Large unusual payment", description: "A payment is unusually large for your accounts." },
];

export const defaultAlertSettings: AlertSettings = {
  phoneE164: "",
  consent: false,
  channels: { app: true, imessage: false },
  alertTypes: Object.fromEntries(alertTypeOptions.map(({ key }) => [key, true])) as Record<AlertTypeKey, boolean>,
  phoneSeverity: "critical_warning",
  hideAmounts: true,
  quietHours: { enabled: false, start: "22:00", end: "08:00" },
};

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function formatUsPhone(value: string) {
  const digits = phoneDigits(value);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function toPhoneE164(value: string) {
  const digits = phoneDigits(value);
  return digits.length === 10 ? `+1${digits}` : "";
}

export function phoneFromE164(value: string) {
  return formatUsPhone(value.startsWith("+1") ? value.slice(2) : value);
}
