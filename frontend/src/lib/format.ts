/** Display-only formatting; never used to derive financial data. */
export const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: Math.abs(value) < 100 ? 2 : 0,
  maximumFractionDigits: Math.abs(value) < 100 ? 2 : 0,
}).format(value);
export const formatCurrencyExact = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value);
export const formatSignedCurrency = (value: number) => `${value < 0 ? "−" : "+"}${formatCurrencyExact(Math.abs(value))}`;
export const formatPercent = (decimal: number) => new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 }).format(decimal);
export const formatRate = (percentNumber: number) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(percentNumber)}%`;
export const formatMonths = (value: number) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)} months`;
export const formatNumber = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
export const formatCompactCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value).replace("K", "k");
export const formatDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const formatMonthLabel = (ym: string) => new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" });
export function formatRelativeTime(iso: string, now = Date.now()) {
  if (!iso) return "not yet";
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return `${Math.floor(minutes / 1440)} days ago`;
}
const LABELS: Record<string, string> = { other_spending: "Other", credit_card: "Credit card", auto_loan: "Auto loan", personal_loan: "Personal loan", ira: "IRA" };
export const humanize = (key: string) => LABELS[key] ?? key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
