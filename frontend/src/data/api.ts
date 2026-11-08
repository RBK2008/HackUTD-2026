
 // Data access layer. Components must read data only through these hooks.
 import { accountPresentation } from "@/lib/accounts";
 import { formatCurrencyExact, humanize } from "@/lib/format";
 import { askGeminiCoach } from "@/data/gemini-coach";
 import type {
   Account,
   AccountDetail,
   AccountType,
   AlertSettings,
   ChatMessage,
   CoachReply,
   Customer,
   CustomerProfile,
   Metric,
   MonthlyRecord,
 } from "./types";
 import { accountsStore, useAccountsStore } from "./accountsStore";
 import { sessionStore, useSession } from "./session";
 import { selectSteadyCustomer } from "./steady-connection";
 import {
   getSteadyCatalogSnapshot,
   saveSteadyAlertPreference,
   useSteadyCatalog,
 } from "./steady-catalog";

 export function useCustomerList(): CustomerProfile[] {
   const { data } = useSteadyCatalog();
   return (data?.customers ?? []).map(({ customerId }) => ({
     id: customerId,
     name: `Demo Customer (${customerId})`,
   }));
 }

 export function useCustomer(): Customer {
   const { selectedCustomerId } = useSession();
   const { data } = useSteadyCatalog();
   const profile =
     data?.profile?.customerId === selectedCustomerId ? data.profile : null;

   return {
     id: selectedCustomerId ?? "",
     name: selectedCustomerId
       ? `Demo Customer (${selectedCustomerId})`
       : "Demo Customer",
     asOf: profile ? data?.accounts[0]?.asOfDate ?? "" : "",
     creditLimit: profile ? Number(profile.creditLimitCents) / 100 : 0,
   };
 }

 export function selectedAccounts(state: {
   accounts: Account[];
   selectedInstitutionId: string;
 }) {
   return state.accounts.filter(
     (account) =>
       state.selectedInstitutionId === "all" ||
       account.institutionId === state.selectedInstitutionId,
   );
 }

 export function getAccountDetails(
   accounts: Account[] = [],
   details: AccountDetail[] = [],
 ) {
   return accounts.flatMap((account) => {
     const detail = details.find((item) => item.id === account.id);
     return detail
       ? [
           accountPresentation(account, {
             ...detail,
             label: account.nickname ?? detail.label,
           }),
         ]
       : [];
   });
 }

 const pncAccountTypes = new Set<string>([
   "checking",
   "savings",
   "ira",
   "cd",
   "credit_card",
   "auto_loan",
   "personal_loan",
   "mortgage",
 ]);

 function useLiveAccountDetails(institutionFilter: string) {
   const state = useAccountsStore();
   const { selectedCustomerId } = useSession();
   const { data } = useSteadyCatalog();

   const pncLinked = state.institutions.some(
     (bank) => bank.id === "inst_pnc",
   );

   if (
     !pncLinked ||
     !["all", "inst_pnc"].includes(institutionFilter) ||
     !data ||
     data.profile?.customerId !== selectedCustomerId
   ) {
     return [];
   }

   const accounts: Account[] = [];
   const details: AccountDetail[] = [];

   for (const row of data.accounts) {
     if (
       row.customerId !== selectedCustomerId ||
       !pncAccountTypes.has(row.accountType)
     ) {
       continue;
     }

     const type = row.accountType as AccountType;
     const label =
       type === "cd"
         ? "Certificate of deposit"
         : humanize(type);

     const balance = Number(row.balanceCents) / 100;

     const chart = data.statements
       .filter((statement) => statement.accountId === row.accountId)
       .sort((a, b) => a.month.localeCompare(b.month))
       .slice(-12)
       .map((statement) => ({
         month: statement.month,
         balance: Number(statement.closingBalanceCents) / 100,
       }));

     const recent = data.transactions
       .filter((transaction) => transaction.accountId === row.accountId)
       .sort(
         (a, b) =>
           b.postedDate.localeCompare(a.postedDate) ||
           b.transactionId.localeCompare(a.transactionId),
       )
       .slice(0, 8)
       .map((transaction) => {
         const amount = Number(transaction.amountCents) / 100;
         const displayValue =
           Number(transaction.balanceChangeCents) / 100;
         const displayLabel =
           transaction.description || humanize(transaction.category);

         return {
           date: transaction.postedDate,
           label: displayLabel,
           displayLabel,
           amount,
           displayValue,
           incoming: displayValue >= 0,
         };
       });

     accounts.push({
       id: row.accountId,
       institutionId: "inst_pnc",
       type,
       balance,
       ...(state.nicknames[row.accountId]
         ? { nickname: state.nicknames[row.accountId] }
         : {}),
       yield: row.annualYieldBasisPoints / 100,
       apr: row.aprBasisPoints / 100,
       monthlyPayment: Number(row.monthlyPaymentCents) / 100,
       ...(type === "credit_card"
         ? {
             creditLimit:
               Number(data.profile.creditLimitCents) / 100,
           }
         : {}),
     });

     details.push({
       id: row.accountId,
       institutionId: "inst_pnc",
       type,
       label,
       history: chart.map((point) => point.balance),
       chart,
       recent,
       coachReply: {
         reply: `Your ${label} balance is ${formatCurrencyExact(balance)}.`,
         sources: ["PNC account snapshot"],
         verified: true,
       },
     });
   }

   return getAccountDetails(accounts, details);
 }

 export function useAccountDetails() {
   return useLiveAccountDetails(
     useAccountsStore().selectedInstitutionId,
   );
 }

 export function useAllAccountDetails() {
   return useLiveAccountDetails("all");
 }

 export function useAccountsSummary(institutionFilter: string) {
   const { institutions } = useAccountsStore();
   const { selectedCustomerId } = useSession();
   const { data } = useSteadyCatalog();
   const totals = data?.totals;

   if (
     !institutions.some((bank) => bank.id === "inst_pnc") ||
     !["all", "inst_pnc"].includes(institutionFilter) ||
     !totals ||
     totals.customerId !== selectedCustomerId
   ) {
     return null;
   }

   return {
     totalAssets: Number(totals.assetsCents) / 100,
     totalDebts: Number(totals.liabilitiesCents) / 100,
     totalMonthlyDebtPayments:
       Number(totals.monthlyDebtPaymentsCents) / 100,
   };
 }

 export function useSelectedInstitution() {
   return useAccountsStore().selectedInstitutionId;
 }

 export function selectInstitution(institutionId: string) {
   accountsStore.selectInstitution(institutionId);
 }

 export function useInstitutions() {
   return useAccountsStore().institutions;
 }

 export function disconnectBank(institutionId: string) {
   accountsStore.disconnectBank(institutionId);
 }

 export function reconnectBank(institutionId: string) {
   return accountsStore.reconnectBank(institutionId);
 }

 export function syncBank(institutionId: string) {
   return accountsStore.syncBank(institutionId);
 }

 export function renameAccount(accountId: string, nickname: string) {
   accountsStore.renameAccount(accountId, nickname);
 }

 export function useMonthly(): { months: MonthlyRecord[] } {
   const { selectedCustomerId } = useSession();
   const { data } = useSteadyCatalog();

   return {
     months: (data?.months ?? [])
       .filter((month) => month.customerId === selectedCustomerId)
       .map((month) => ({
         month: month.month,
         income: Number(month.incomeCents) / 100,
         spending: Number(month.spendingCents) / 100,
         debtCosts: Number(month.creditCardPaymentsCents) / 100,
         creditCardBalance:
           Number(month.creditCardBalanceCents) / 100,
         savingsBalance:
           Number(month.savingsBalanceCents) / 100,
         debtToIncome: null,
         cashFlow: null,
       })),
   };
 }

 export function useMetrics(): Metric[] {
   return [];
 }

 function notifyReset(type: "reset-all" | "clear-coach") {
   if (typeof window !== "undefined") {
     window.dispatchEvent(new CustomEvent(`steady:${type}`));
   }
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

 export function clearCoachChat() {
   notifyReset("clear-coach");
 }

 export function signOut() {
   accountsStore.reset();
   notifyReset("reset-all");
   sessionStore.signOut();
 }

 export async function sendTestAlert(
   _phoneE164: string,
 ): Promise<void> {
   throw new Error(
     "Phone delivery is unavailable until the notification service is connected.",
   );
 }

 export async function saveAlertSettings(
   settings: AlertSettings,
 ): Promise<void> {
   await saveSteadyAlertPreference(
     settings.alertTypes.cardBalanceRising,
   );
   sessionStore.saveAlertSettings(settings);
 }

 export async function sendCoachMessage(
   message: string,
   _history: ChatMessage[],
   context?: { alertId?: string },
 ): Promise<CoachReply> {
   const { data } = getSteadyCatalogSnapshot();
   const customerId =
     sessionStore.getSnapshot().selectedCustomerId;

   const unavailable: CoachReply = {
     reply:
       "Coach can show cloud account balances, totals, monthly spending, and current alerts. AI explanations are currently unavailable.",
     sources: [],
     verified: false,
   };

   if (
     !data ||
     !customerId ||
     data.profile?.customerId !== customerId
   ) {
     return unavailable;
   }

   const currency = (cents: bigint) =>
     formatCurrencyExact(Number(cents) / 100);

   // Preserve the existing verified alert response.
   if (context?.alertId) {
     const alert = data.alerts.find(
       (row) =>
         row.customerId === customerId &&
         row.id === context.alertId,
     );

     return alert
       ? {
           reply: `Your credit card closing balance increased by ${currency(alert.increaseCents)} in ${alert.month} compared with the previous month.`,
           sources: ["SpacetimeDB · PNC alerts"],
           verified: true,
         }
       : unavailable;
   }

   // Gemini receives a limited snapshot for the selected customer.
   const totalsForAI =
     data.totals?.customerId === customerId
       ? data.totals
       : null;

   if (totalsForAI) {
     const recentMonths = data.months
       .filter((row) => row.customerId === customerId)
       .sort((a, b) => b.month.localeCompare(a.month))
       .slice(0, 6)
       .map((row) => ({
         month: row.month,
         income: Number(row.incomeCents) / 100,
         spending: Number(row.spendingCents) / 100,
       }));

     try {
       const result = await askGeminiCoach({
         data: {
           message,
           snapshot: {
             customerId,
             assets:
               Number(totalsForAI.assetsCents) / 100,
             debts:
               Number(totalsForAI.liabilitiesCents) / 100,
             netWorth:
               Number(totalsForAI.netWorthCents) / 100,
             monthlyDebtPayments:
               Number(
                 totalsForAI.monthlyDebtPaymentsCents,
               ) / 100,
             recentMonths,
           },
         },
       });

       return {
         reply: result.reply,
         sources: [
           "SpacetimeDB · PNC financial snapshot",
           "Gemini AI",
         ],
         verified: false,
       };
     } catch (error) {
       console.error(
         "Gemini Coach unavailable:",
         error,
       );
       // Fall through to existing rule-based answers.
     }
   }

   // Existing verified fallback responses.
   const question = message.trim().toLowerCase();
   const totals =
     data.totals?.customerId === customerId
       ? data.totals
       : null;

   if (
     totals &&
     (question.includes("net worth") ||
       question.includes("how much do i have and owe"))
   ) {
     return {
       reply: `Your listed accounts have ${currency(totals.assetsCents)} in assets and ${currency(totals.liabilitiesCents)} in liabilities. Your listed-account net worth is ${currency(totals.netWorthCents)}.`,
       sources: ["SpacetimeDB · PNC account totals"],
       verified: true,
     };
   }

   if (
     totals &&
     question.includes("monthly debt payments")
   ) {
     return {
       reply: `Your scheduled monthly debt payments total ${currency(totals.monthlyDebtPaymentsCents)}.`,
       sources: ["SpacetimeDB · PNC account totals"],
       verified: true,
     };
   }

   if (question.includes("spending last month")) {
     const latest = data.months
       .filter((row) => row.customerId === customerId)
       .sort((a, b) =>
         b.month.localeCompare(a.month),
       )[0];

     if (latest) {
       return {
         reply: `Your latest statement month is ${latest.month}. Recorded spending was ${currency(latest.spendingCents)} and recorded income was ${currency(latest.incomeCents)}.`,
         sources: [
           "SpacetimeDB · PNC monthly summary",
         ],
         verified: true,
       };
     }
   }

   const account = data.accounts.find((row) => {
     const label =
       row.accountType === "cd"
         ? "Certificate of deposit"
         : humanize(row.accountType);

     return (
       row.customerId === customerId &&
       question ===
         `tell me about my ${label.toLowerCase()}`
     );
   });

   return account
     ? {
         reply: `The balance for ${humanize(account.accountType)} is ${currency(account.balanceCents)}.`,
         sources: [
           "SpacetimeDB · PNC account snapshot",
         ],
         verified: true,
       }
     : unavailable;
 }
