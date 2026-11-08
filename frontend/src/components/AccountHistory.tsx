import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AccountView } from "@/lib/accounts";
import { formatCurrency, formatMonthLabel } from "@/lib/format";

export function AccountHistory({ account, compact = false }: { account: AccountView; compact?: boolean }) {
  return <div className={compact ? "h-16 w-full" : "h-64 w-full"} role="img" aria-label={`${account.label} balance history, November 2025 to October 2026`}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={account.chart} margin={compact ? { top: 6, right: 2, left: 2, bottom: 6 } : { top: 16, right: 12, left: 0, bottom: 8 }}>
        {!compact && <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />}
        {!compact && <XAxis dataKey="month" tickFormatter={formatMonthLabel} axisLine={false} tickLine={false} minTickGap={22} tick={{ fill: "var(--muted-foreground)", fontFamily: "var(--font-serif)", fontSize: 12 }} />}
        {!compact && <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: 8, fontFamily: "var(--font-serif)" }} />}
        <YAxis hide={compact} width={60} domain={compact ? ["dataMin", "dataMax"] : account.type === "credit_card" ? [0, "auto"] : ["auto", "auto"]} tickFormatter={(value: number) => formatCurrency(value)} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontFamily: "var(--font-serif)", fontSize: 12 }} />
        {!compact && account.type === "credit_card" && account.creditLimit !== undefined && <ReferenceLine y={account.creditLimit} stroke="var(--risk)" strokeDasharray="6 4" label={{ value: `Limit ${formatCurrency(account.creditLimit)}`, position: "insideTopRight", fill: "var(--risk)", fontSize: 12 }} />}
        <Line dataKey="balance" name="Balance" stroke={account.changeTone === "good" ? "var(--primary)" : account.changeTone === "bad" ? "var(--risk)" : "var(--muted-foreground)"} strokeWidth={compact ? 2 : 2.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}