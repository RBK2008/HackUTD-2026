import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { AlertSeverity, MetricStatus } from "@/data/types";
import { cn } from "@/lib/utils";

export const STATUS = {
  good: { label: "On track", icon: CheckCircle2, cls: "bg-good-soft text-good", stroke: "var(--good)" },
  watch: { label: "Keep an eye on", icon: AlertTriangle, cls: "bg-watch-soft text-watch", stroke: "var(--watch)" },
  risk: { label: "Needs attention", icon: AlertOctagon, cls: "bg-risk-soft text-risk", stroke: "var(--risk)" },
} as const;

export function StatusPill({ status }: { status: MetricStatus }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.cls)}>
      <s.icon className="h-3.5 w-3.5" /> {s.label}
    </span>
  );
}

export const SEVERITY = {
  critical: { label: "Critical", icon: AlertOctagon, cls: "bg-risk-soft text-risk border-risk-border", text: "text-risk" },
  warning: { label: "Warning", icon: AlertTriangle, cls: "bg-watch-soft text-watch border-watch/30", text: "text-watch" },
  info: { label: "Info", icon: Info, cls: "bg-accent text-primary border-primary/20", text: "text-primary" },
} satisfies Record<AlertSeverity, unknown>;
