import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCustomer, useMonthly } from "@/data/api";
import { formatMonthLabel, formatCurrency, formatPercent, formatCompactCurrency } from "@/lib/format";

export function AlertTrend({ metricId }: { metricId: string }) {
  const { months } = useMonthly();
  const customer = useCustomer();
  const credit = metricId === "credit_utilization";
  const data = months.map((month) => ({ ...month, label: formatMonthLabel(month.month), value: credit ? month.creditCardBalance : metricId === "emergency_fund" ? month.savingsBalance : metricId === "debt_to_income" ? month.debtToIncome : month.cashFlow }));
  const ratio = metricId === "debt_to_income";
  return <section>
    <h3 className="mb-3 font-serif text-lg font-semibold">{credit ? "Credit card balance" : metricId === "emergency_fund" ? "Savings balance" : ratio ? "Debt-to-income" : "Monthly cash flow"} · 12 months</h3>
    <div className="h-52 w-full" role="img" aria-label="12-month financial trend">
      <ResponsiveContainer><LineChart data={data} margin={{ top: 15, right: 12, left: 0, bottom: 5 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontFamily: "var(--font-serif)" }} axisLine={false} tickLine={false} minTickGap={22} />
        <YAxis width={55} domain={[0, "auto"]} tickFormatter={(value: number) => ratio ? formatPercent(value) : formatCompactCurrency(value)} tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontFamily: "var(--font-serif)" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value: number) => ratio ? formatPercent(value) : formatCurrency(value)} contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: 8 }} />
        {credit && <ReferenceLine y={customer.creditLimit} stroke="var(--risk)" strokeDasharray="6 4" label={{ value: `Limit ${formatCurrency(customer.creditLimit)}`, position: "insideTopRight", fill: "var(--risk)", fontSize: 12 }} />}
        <Line dataKey="value" name={credit ? "Card balance" : "History"} stroke="var(--primary)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
      </LineChart></ResponsiveContainer>
    </div>
  </section>;
}