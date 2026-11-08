import { useSteadyCatalog } from "@/data/steady-catalog";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ReactNode } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useCustomer, useAccountsSummary, useSelectedInstitution } from "@/data/api";
import { useAlertsStore } from "@/data/alertsStore";
import { SEVERITY } from "@/components/Status";
import { formatDate, formatMonthLabel, formatCurrency, formatCompactCurrency, formatRate, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Steady financial health" },
      { name: "description", content: "See your whole financial picture, health indicators, and alerts in one calm dashboard." },
      { property: "og:title", content: "Dashboard — Steady financial health" },
      { property: "og:description", content: "See your whole financial picture, health indicators, and alerts in one calm dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-soft)" };
const axisTick = { fontSize: 13, fill: "var(--muted-foreground)", fontFamily: "var(--font-serif)" };


function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-soft md:p-6", className)}>
      {title && <h2 className="mb-4 text-center text-base font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

function Dashboard() {
  const customer = useCustomer();
  const { data, error } = useSteadyCatalog();
  const selected = data?.profile?.customerId === customer.id ? data : null;
  const summary = useAccountsSummary(useSelectedInstitution());
  const { alerts } = useAlertsStore();

  const topAlert = alerts.find((a) => !a.read);
  const monthData = (selected?.months ?? []).map((month) => ({
    label: formatMonthLabel(month.month),
    income: Number(month.incomeCents) / 100,
    spending: Number(month.spendingCents) / 100,
    creditCardPayments: Number(month.creditCardPaymentsCents) / 100,
    creditCardBalance: Number(month.creditCardBalanceCents) / 100,
  }));
  const categories = (selected?.spendingCategories ?? [])
    .filter((row) => row.customerId === customer.id)
    .map((row) => ({
      label: humanize(row.category),
      amount: Number(row.amountCents) / 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  const accounts = (selected?.accounts ?? []).map((account) => ({
    id: account.accountId,
    type: account.accountType,
    balance: Number(account.balanceCents) / 100,
    yield: account.annualYieldBasisPoints / 100,
    apr: account.aprBasisPoints / 100,
    monthlyPayment: Number(account.monthlyPaymentCents) / 100,
  }));
  const creditLimit = selected?.profile ? Number(selected.profile.creditLimitCents) / 100 : undefined;
  const assets = accounts.filter((a) => ["checking", "savings", "ira", "cd"].includes(a.type));
  const debts = accounts.filter((a) => !["checking", "savings", "ira", "cd"].includes(a.type));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
      <div className="space-y-6 rounded-3xl bg-background">
      <div>
        <h1 className="text-center text-2xl font-bold tracking-tight md:text-3xl">Your Financial Health</h1>
        <p className="mt-1 text-sm text-muted-foreground">{customer.asOf ? `As of ${formatDate(customer.asOf)}` : "PNC financial snapshot"}</p>
      </div>

      {topAlert && (() => {
        const s = SEVERITY[topAlert.severity];
        return (
          <div className={cn("flex flex-col gap-3 rounded-2xl border p-5 text-center", s.cls)}>
            <s.icon className="mx-auto h-6 w-6 shrink-0" />
            <div className="flex-1 text-foreground">
              <p className={cn("text-xs font-bold uppercase tracking-wide", s.text)}>{s.label} alert</p>
              <p className="mt-0.5 font-semibold">{topAlert.title}</p>
              <p className="text-sm text-muted-foreground">{topAlert.reason}</p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm"><Lightbulb className="h-4 w-4" /> {topAlert.suggestedAction}</p>
            </div>
            <div className="flex justify-center">
              <Button asChild variant="ghost" size="sm"><Link to="/coach" search={{ alertId: topAlert.id }}><MessageCircle />Ask about this</Link></Button>
            </div>
          </div>
        );
      })()}

      <p className="text-sm text-muted-foreground">Health metrics are unavailable for this dataset.</p>
      </div>

      {!selected && <p role={error ? "alert" : "status"} className="text-sm text-muted-foreground">{error ?? "Loading PNC data for the selected customer…"}</p>}
      <Card title="Money in vs. money out">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={monthData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatCompactCurrency} tick={axisTick} axisLine={false} tickLine={false} width={44} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar isAnimationActive={false} dataKey="income" name="Income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar isAnimationActive={false} dataKey="spending" name="Spending" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar isAnimationActive={false} dataKey="creditCardPayments" name="Credit card payments" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Credit card balance trend">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 12000]} tickFormatter={formatCompactCurrency} tick={axisTick} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                {creditLimit !== undefined && <ReferenceLine y={creditLimit} stroke="var(--risk)" strokeDasharray="6 4"
                  label={{ value: `Limit ${formatCurrency(creditLimit)}`, position: "insideBottomRight", fill: "var(--risk)", fontSize: 12 }} />}
                <Line isAnimationActive={false} type="monotone" dataKey="creditCardBalance" name="Card balance" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Where your money went last month">
          {categories.length ? (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={categories} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" tickFormatter={formatCompactCurrency} tick={axisTick} />
                  <YAxis type="category" dataKey="label" tick={axisTick} width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Bar isAnimationActive={false} dataKey="amount" name="Spent" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {selected ? "No categorized spending for the latest statement month." : "Loading category totals…"}
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="What you have">
          <ul className="divide-y">
            {assets.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{humanize(a.type)}</p>
                  <p className="font-serif text-sm text-muted-foreground">{a.yield ? `${formatRate(a.yield)} yield` : "No yield"}</p>
                </div>
                <p className="font-serif text-lg font-semibold tabular-nums">{formatCurrency(a.balance)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t pt-3 font-bold">
            <span>Total</span><span className="font-serif text-lg tabular-nums text-good">{summary ? formatCurrency(summary.totalAssets) : "—"}</span>
          </div>
        </Card>
        <Card title="What you owe">
          <ul className="divide-y">
            {debts.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{humanize(a.type)}</p>
                  <p className="font-serif text-sm text-muted-foreground">{formatRate(a.apr ?? 0)} APR · {formatCurrency(a.monthlyPayment ?? 0)}/mo</p>
                </div>
                <p className="font-serif text-lg font-semibold tabular-nums">{formatCurrency(a.balance)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span className="text-right tabular-nums">
              <span className="font-serif text-lg">{summary ? formatCurrency(summary.totalDebts) : "—"}</span>
              <span className="font-serif block text-sm font-medium text-muted-foreground">{summary ? formatCurrency(summary.totalMonthlyDebtPayments) : "—"}/mo</span>
            </span>
          </div>
        </Card>
      </div>

      <p className="pb-4 text-center text-xs text-muted-foreground">
        Numbers are calculated from your account data. AI explanations are labeled separately.
      </p>
      <Button asChild className="fixed bottom-20 right-4 z-20 shadow-soft md:bottom-6 md:right-6"><Link to="/coach"><MessageCircle />Ask the coach</Link></Button>
    </div>
  );
}
