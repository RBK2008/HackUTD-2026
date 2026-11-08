import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCheck, CheckCircle2, ChevronRight, Smartphone } from "lucide-react";
import { useAlertsStore } from "@/data/alertsStore";
import { Button } from "@/components/ui/button";
import { AlertDetail } from "@/components/AlertDetail";
import { SEVERITY } from "@/components/Status";
import { alertFilters, filterAlerts, groupAlerts, type AlertFilter } from "@/lib/alerts";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Steady" },
      { name: "description", content: "Review account alerts, understand what changed, and take the next step with Steady." },
      { property: "og:title", content: "Alerts — Steady" },
      { property: "og:description", content: "Review account alerts, understand what changed, and take the next step with Steady." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  const { alerts, markAsRead, markAllAsRead, dismiss } = useAlertsStore();
  const [filter, setFilter] = useState<AlertFilter>("All");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [today, setToday] = useState("");
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);
  const groups = groupAlerts(filterAlerts(alerts, filter), today);
  return <div className="mx-auto max-w-4xl space-y-7 px-4 py-8 md:px-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold">Alerts</h1><p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">We watch your accounts and tell you when something needs attention.</p></div><Button variant="secondary" className="w-fit" disabled={!alerts.some((alert) => !alert.read)} onClick={markAllAsRead}><CheckCheck />Mark all as read</Button></header>
    <div className="flex flex-wrap gap-2 border-b pb-4" role="tablist" aria-label="Alert filters">{alertFilters.map((tab) => <Button key={tab} role="tab" aria-selected={tab === filter} variant={tab === filter ? "default" : "ghost"} onClick={() => setFilter(tab)} className="gap-2">{tab}<span className="rounded-md bg-card/20 px-1.5 text-xs tabular-nums">{filterAlerts(alerts, tab).length}</span></Button>)}</div>
    <div className="space-y-6" role="tabpanel" aria-label={`${filter} alerts`}>
      {groups.length === 0 && <div className="flex flex-col items-center py-16 text-center"><CheckCircle2 className="mb-4 h-10 w-10 text-good" /><p className="font-semibold">Nothing here. You're all caught up.</p></div>}
      {groups.map((group) => <section key={group.label}><h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{group.label}</h2><div className="space-y-3">{group.alerts.map((alert) => { const severity = SEVERITY[alert.severity]; return <Button key={alert.id} variant="ghost" className={cn("h-auto w-full justify-start whitespace-normal rounded-lg border bg-card p-4 text-left shadow-soft hover:bg-card sm:p-5")} onClick={() => { markAsRead(alert.id); setSelectedId(alert.id); }} aria-label={`Open alert: ${alert.title}`}>
        <div className={cn("self-start rounded-lg p-2", severity.cls)}><severity.icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={cn("text-xs font-semibold", severity.text)}>{severity.label}</span>{!alert.read && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}{alert.isDemo && <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] text-primary">Demo event</span>}</div><h3 className="mt-1 text-base font-semibold">{alert.title}</h3><p className="mt-1 text-sm font-normal leading-relaxed text-muted-foreground">{alert.reason}</p><div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-normal text-muted-foreground"><time dateTime={alert.date}>{formatDate(alert.date)}</time>{alert.channels?.includes("imessage") && <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1"><Smartphone className="h-3 w-3" />Sent to iMessage</span>}</div></div><ChevronRight className="text-muted-foreground" />
      </Button>; })}</div></section>)}
    </div>
    <AlertDetail alert={alerts.find((alert) => alert.id === selectedId)} onClose={() => setSelectedId(undefined)} onDismiss={(id) => { dismiss(id); setSelectedId(undefined); }} />
  </div>;
}
