import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { MonthlyRecord } from "@/data/types";
import { formatMonthLabel, formatPercent } from "@/lib/format";

const axisTick = {
  fontSize: 13,
  fill: "var(--muted-foreground)",
  fontFamily: "var(--font-serif)",
};

export function DebtToIncomeTrend({ months }: { months: MonthlyRecord[] }) {
  const history = months;
  const first = history[0];
  const last = history.at(-1);

  return (
    <section className="min-w-0 text-center" aria-label="Debt-to-income ratio history">
      <h3 className="font-serif text-lg font-semibold">Debt-to-income over time</h3>
      {first && last && (
        <p className="mt-1 text-sm text-muted-foreground">
          {formatMonthLabel(first.month)} – {formatMonthLabel(last.month)}
        </p>
      )}
      {history.some((point) => point.debtToIncome !== null) ? (
        <div className="mt-4 h-56 w-full font-serif">
          <ResponsiveContainer>
            <LineChart data={history} margin={{ top: 8, right: 16, bottom: 8, left: 0 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={axisTick} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tickFormatter={formatPercent} tick={axisTick} axisLine={false} tickLine={false} width={44} domain={[0, 0.6]} />
              <Tooltip
                labelFormatter={(month) => formatMonthLabel(String(month))}
                formatter={(value: number) => [formatPercent(value), "Debt-to-income"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-soft)" }}
              />
              <Line dataKey="debtToIncome" name="Debt-to-income" type="linear" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--chart-1)" }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-8 text-sm text-muted-foreground">No debt-to-income history available.</p>
      )}
    </section>
  );
}