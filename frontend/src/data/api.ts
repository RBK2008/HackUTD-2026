// Data access layer. Components must read data only through these hooks.
// Swap the internals for real API calls later; signatures stay the same.
import { accountDetails, accountsSummaries, mockCoachReplies, mockData } from "./mock";
import { accountPresentation } from "@/lib/accounts";
import { createDemoAlert, demoEvents } from "./demoAlerts";
import type { Account, Alert, AlertSettings, ChatMessage, CoachReply, Customer, CustomerProfile, Metric, MonthlyRecord, SpendingByCategory } from "./types";
import { accountsStore, useAccountsStore, type AccountChange } from "./accountsStore";
import { demoCustomers } from "./customerFixtures";
import { sessionStore, useSession } from "./session";
import { selectSteadyCustomer } from "./steady-connection";
import { useSteadyTotals } from "./steady-totals";

export function useCustomerList(): CustomerProfile[] { return demoCustomers; }

export function useCustomer(): Customer {
  const session = useSession();
  const selected = demoCustomers.find((customer) => customer.id === session.selectedCustomerId);
  return { ...mockData.customer, id: selected?.id ?? "C024", name: selected?.name ?? mockData.customer.name };
}

export function useAccounts(): Account[] {
  const state = useAccountsStore();
  return selectedAccounts(state);
}

export function selectedAccounts(state: { accounts: Account[]; selectedInstitutionId: string }) {
  return state.accounts.filter((account) => state.selectedInstitutionId === "all" || account.institutionId === state.selectedInstitutionId);
}

export function getAccountDetails(accounts = mockData.accounts, details = accountDetails) {
  return accounts.flatMap((account) => {
    const detail = details.find((item) => item.id === account.id);
    return detail ? [accountPresentation(account, { ...detail, label: account.nickname ?? detail.label })] : [];
  });
}

export function useAccountDetails() {
  const state = useAccountsStore();
  return getAccountDetails(selectedAccounts(state), state.details);
}
export function useAllAccountDetails() {
  const state = useAccountsStore();
  return getAccountDetails(state.accounts, state.details);
}
export function getAccountsSummary(institutionFilter: string, institutions: { id: string }[]) {
  const pnc = institutions.some((bank) => bank.id === "inst_pnc");
  const platypus = institutions.some((bank) => bank.id === "inst_platypus");
  if (institutionFilter === "inst_pnc") return pnc ? accountsSummaries.pnc : accountsSummaries.empty;
  if (institutionFilter === "inst_platypus") return platypus ? accountsSummaries.platypus : accountsSummaries.empty;
  return pnc && platypus ? accountsSummaries.allLinked : pnc ? accountsSummaries.pnc : platypus ? accountsSummaries.platypus : accountsSummaries.empty;
}
export function useAccountsSummary(institutionFilter: string) {
  const state = useAccountsStore();
  const session = useSession();
  const { totals } = useSteadyTotals();
  const linkedInstitutions = state.institutions.filter((bank) =>
    state.accounts.some((account) => account.institutionId === bank.id),
  );
  const hasPnc = linkedInstitutions.some((bank) => bank.id === "inst_pnc");
  const hasDemoBank = linkedInstitutions.some((bank) => bank.id === "inst_platypus");
  const showPncTotals =
    hasPnc &&
    (institutionFilter === "inst_pnc" || (institutionFilter === "all" && !hasDemoBank));

  if (!showPncTotals) {
    return getAccountsSummary(institutionFilter, linkedInstitutions);
  }

  if (!totals || totals.customerId !== session.selectedCustomerId) {
    return accountsSummaries.empty;
  }

  return {
    totalAssets: Number(totals.assetsCents) / 100,
    totalDebts: Number(totals.liabilitiesCents) / 100,
    totalMonthlyDebtPayments: Number(totals.monthlyDebtPaymentsCents) / 100,
  };
}
export function useSelectedInstitution() { return useAccountsStore().selectedInstitutionId; }
export function selectInstitution(institutionId: string) { accountsStore.selectInstitution(institutionId); }
export function useInstitutions() { return useAccountsStore().institutions; }
export function useAllAccounts() { return useAccountsStore().accounts; }
export function subscribeToAccountChanges(callback: (change: AccountChange) => void) { return accountsStore.subscribeToAccountChanges(callback); }
let healthHighlightPending: string[] = [];
export async function connectBank() {
  await accountsStore.connectBank();
  healthHighlightPending = mockData.metricsAfterLinking.filter((metric) => mockData.metrics.find((base) => base.id === metric.id)?.status !== metric.status).map((metric) => metric.id);
}
export function consumeHealthHighlight() {
  const pending = healthHighlightPending;
  healthHighlightPending = [];
  return pending;
}
export function disconnectBank(institutionId: string) { accountsStore.disconnectBank(institutionId); }
export function reconnectBank(institutionId: string) { return accountsStore.reconnectBank(institutionId); }
export function syncBank(institutionId: string) { return accountsStore.syncBank(institutionId); }
export function renameAccount(accountId: string, nickname: string) { accountsStore.renameAccount(accountId, nickname); }

export function useMonthly(): { months: MonthlyRecord[]; spendingByCategoryLastMonth: SpendingByCategory } {
  return { months: mockData.monthly, spendingByCategoryLastMonth: mockData.spendingByCategoryLastMonth };
}

export function useMetrics(): Metric[] {
  const linked = useAccountsStore().institutions.some((bank) => bank.id === "inst_platypus" && bank.status === "synced");
  return linked ? mockData.metricsAfterLinking : mockData.metrics;
}
export function useAlerts(): Alert[] { return mockData.alerts; }

function notifyReset(type: "reset-all" | "clear-coach") {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(`steady:${type}`));
}
export async function selectCustomer(id: string): Promise<void> {
  await selectSteadyCustomer(id);
  accountsStore.reset();
  sessionStore.selectCustomer(id);
  notifyReset("reset-all");
}
export function resetDemoData() {
  accountsStore.reset();
  sessionStore.clearConnectedItems();
  notifyReset("reset-all");
}
export function clearCoachChat() { notifyReset("clear-coach"); }
export function signOut() {
  accountsStore.reset();
  notifyReset("reset-all");
  sessionStore.signOut();
}

export async function createLinkToken(): Promise<string> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));
  return `link-sandbox-mock-${Math.random().toString(36).slice(2)}`;
}
export async function exchangePublicToken(publicToken: string, institutionName: string): Promise<{ itemId: string; institutionId: string }> {
  void publicToken; void institutionName;
  await new Promise<void>((resolve) => setTimeout(resolve, 1500));
  return { itemId: `item-mock-${Math.random().toString(36).slice(2)}`, institutionId: "inst_platypus" };
}
export async function sendTestAlert(phoneE164: string): Promise<void> {
  void phoneE164;
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
}
export async function saveAlertSettings(settings: AlertSettings): Promise<void> {
  await Promise.resolve();
  sessionStore.saveAlertSettings(settings);
}
export async function injectDemoEvent(eventType: string): Promise<Alert> {
  await new Promise<void>((resolve) => setTimeout(resolve, 800));
  return createDemoAlert(eventType, new Date().toISOString().slice(0, 10));
}

// Single replacement boundary for a future backend /api/chat call.
export async function sendCoachMessage(message: string, history: ChatMessage[], context?: { alertId?: string }): Promise<CoachReply> {
  void history;
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  const text = message.toLowerCase();
  const state = accountsStore.getSnapshot();
  const account = getAccountDetails(selectedAccounts(state), state.details).find((item) => text === `tell me about my ${item.label.toLowerCase()}`);
  if (account) return account.coachReply;
  if (text.includes("explain this alert")) {
    const availableAlerts = [...mockData.alerts, ...demoEvents.map((event) => createDemoAlert(event.type, ""))];
    const alert = context?.alertId ? availableAlerts.find((a) => a.id === context.alertId) : availableAlerts.find((a) => text.includes(a.title.toLowerCase()));
    if (alert) return { reply: `${alert.reason} ${alert.suggestedAction}`, sources: ["Alerts"], verified: true };
  } else if (text.includes("credit") && /red|use|utilization/.test(text)) {
    return mockCoachReplies[0];
  } else if (/money go|spend|spending/.test(text)) {
    return mockCoachReplies[1];
  } else if (text.includes("income") && text.includes("debt")) {
    return mockCoachReplies[2];
  } else if (/\$50|50 more|pay more/.test(text)) {
    return mockCoachReplies[3];
  }
  return mockCoachReplies[4];
}
