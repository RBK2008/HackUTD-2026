export type AssetType = "checking" | "savings" | "ira" | "cd";
export type DebtType = "credit_card" | "auto_loan" | "personal_loan" | "mortgage";
export type AccountType = AssetType | DebtType;

export interface Customer {
  id: string;
  name: string;
  asOf: string;
  creditLimit: number;
}

export type CustomerProfile = {
  id: string;
  name: string;
  health?: { good: number; watch: number; risk: number };
};

export type ConnectedItem = {
  itemId: string;
  institutionName: string;
  connectedAt: string;
};

export type AlertTypeKey =
  | "overCreditLimit"
  | "highCardUse"
  | "cardBalanceRising"
  | "lowEmergencyFund"
  | "highDebtPayments"
  | "spendingOverIncome"
  | "feesCharged"
  | "missingPaycheck"
  | "largeUnusualPayment";

export type AlertSettings = {
  phoneE164: string;
  consent: boolean;
  channels: { app: true; imessage: boolean };
  alertTypes: Record<AlertTypeKey, boolean>;
  phoneSeverity: "critical" | "critical_warning" | "all";
  hideAmounts: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
};

export interface Account {
  id: string;
  institutionId: string;
  type: AccountType;
  balance: number;
  yield?: number;
  apr?: number;
  monthlyPayment?: number;
  creditLimit?: number;
  nickname?: string;
  change12m?: number;
  changeMagnitude?: number;
  changeDirection?: "up" | "down";
  changeTone?: "good" | "bad" | "neutral";
  utilization?: number;
  overLimit?: boolean;
  usageWidth?: string;
  usagePercent?: number;
  usageTone?: "good" | "bad";
  limitWidth?: string;
}

export type Institution = { id: string; name: string; source: "pnc" | "plaid"; status: "synced" | "syncing" | "needs_reauth" | "error"; lastSynced: string };

export type AccountDetail = {
  id: string;
  institutionId: string;
  type: string;
  label: string;
  history: number[];
  chart: { month: string; balance: number }[];
  coachReply: CoachReply;
  recent: { date: string; label: string; amount: number; displayValue: number; incoming: boolean; displayLabel: string }[];
  payoff?: { years: number; months: number; totalInterest: number; assumption: string };
};

export interface MonthlyRecord {
  month: string;
  income: number;
  spending: number;
  debtCosts: number;
  creditCardBalance: number;
  savingsBalance: number;
  debtToIncome: number | null;
  cashFlow: number | null;
}

export type SpendingByCategory = { category: string; label: string; amount: number }[];
export type AccountsSummary = { totalAssets: number; totalDebts: number; totalMonthlyDebtPayments: number };

export type ChatMessage = {
  id: string;
  role: "user" | "coach";
  text: string;
  createdAt: string;
  sources?: string[];
};

export type CoachReply = { reply: string; sources: string[]; verified: boolean };

export type MetricStatus = "good" | "watch" | "risk";
export type MetricUnit = "months" | "percent" | "dollars";

export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: MetricUnit;
  status: MetricStatus;
  target: string;
  explanation: string;
  goalProgress?: number;
  ringOffset?: number;
  pieData?: { name: string; value: number }[];
  cashAxis?: { bound: number; barX: number; barWidth: number; labelX: number; negative: boolean; tone: "good" | "bad"; ticks: { x: number; label: string }[] };
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  reason: string;
  suggestedAction: string;
  date: string;
  read: boolean;
  metricId?: string;
  channels?: ("app" | "imessage")[];
  isDemo?: boolean;
}

export interface MockData {
  customer: Customer;
  accounts: Account[];
  monthly: MonthlyRecord[];
  spendingByCategoryLastMonth: SpendingByCategory;
  metrics: Metric[];
  metricsAfterLinking: Metric[];
  alerts: Alert[];
}
