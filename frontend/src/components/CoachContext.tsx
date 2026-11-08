import { StatusPill } from "@/components/Status";
import { CoachAlertCard } from "@/components/CoachAlertCard";
import { useCustomer, useMetrics } from "@/data/api";
import { useAlertsStore } from "@/data/alertsStore";
import type { Alert } from "@/data/types";
import { formatDate, formatPercent, formatCurrency, formatMonths } from "@/lib/format";

export function CoachContext({ onAsk }: { onAsk: (alert: Alert) => void }) {
  const metrics = useMetrics();
  const unread = useAlertsStore().alerts.filter((alert) => !alert.read);
  const customer = useCustomer();
  return (
    <div className="space-y-6">
      <section className="divide-y">
        {metrics.map((metric) => (
          <div key={metric.id} className="py-4 text-center first:pt-0">
            <h3 className="font-serif text-lg font-semibold">{metric.label}</h3>
            <p className="my-1 font-serif text-2xl font-semibold tabular-nums">{metric.unit === "percent" ? formatPercent(metric.value) : metric.unit === "dollars" ? formatCurrency(metric.value) : formatMonths(metric.value)}</p>
            <StatusPill status={metric.status} />
          </div>
        ))}
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold">Unread alerts</h3>
        <div className="space-y-3">{unread.map((alert) => <CoachAlertCard key={alert.id} alert={alert} onAsk={onAsk} />)}</div>
      </section>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">{customer.asOf ? `Answers use ${customer.id} account data as of ${formatDate(customer.asOf)}.` : "Waiting for the selected customer’s account data."}</p>
    </div>
  );
}