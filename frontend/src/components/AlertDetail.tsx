import { Link } from "@tanstack/react-router";
import { Lightbulb, MessageCircle, Smartphone, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SEVERITY } from "@/components/Status";
import { AlertTrend } from "@/components/AlertTrend";
import { useMetrics } from "@/data/api";
import type { Alert } from "@/data/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AlertDetail({ alert, onClose, onDismiss }: { alert: Alert | undefined; onClose: () => void; onDismiss: (id: string) => void }) {
  const metric = useMetrics().find((item) => item.id === alert?.metricId);
  return <Sheet open={Boolean(alert)} onOpenChange={(open) => { if (!open) onClose(); }}>
    <SheetContent className="w-full overflow-y-auto bg-card p-6 sm:max-w-xl sm:p-8">
      {alert && <>
        <SheetHeader className="pr-6 text-left">
          <span className={cn("mb-2 inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold", SEVERITY[alert.severity].cls)}>{(() => { const Icon = SEVERITY[alert.severity].icon; return <Icon className="h-4 w-4" />; })()}{SEVERITY[alert.severity].label}</span>
          <SheetTitle className="text-xl leading-snug">{alert.title}</SheetTitle>
          <SheetDescription>{formatDate(alert.date)}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {alert.channels?.includes("imessage") && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Smartphone className="h-4 w-4" />Sent to iMessage{alert.isDemo && <span>· Demo event</span>}</p>}
          <section><h3 className="mb-2 font-semibold">What happened</h3><p className="text-sm leading-relaxed text-muted-foreground">{alert.reason}</p></section>
          <section><h3 className="mb-2 font-semibold">Why it matters</h3><p className="text-sm leading-relaxed text-muted-foreground">{metric?.explanation ?? "Fees reduce the money available for your everyday needs and savings."}</p></section>
          <section className="rounded-lg bg-accent p-4"><h3 className="mb-2 flex items-center gap-2 font-semibold text-primary"><Lightbulb className="h-4 w-4" />What you can do</h3><p className="text-sm leading-relaxed">{alert.suggestedAction}</p></section>
          {alert.metricId && <AlertTrend metricId={alert.metricId} />}
          <div className="flex flex-col gap-3">
            <Button asChild className="h-auto min-h-10 whitespace-normal py-3"><Link to="/coach" search={{ alertId: alert.id }}><MessageCircle />Ask the coach about this</Link></Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => onDismiss(alert.id)}><Trash2 />Dismiss</Button>
          </div>
        </div>
      </>}
    </SheetContent>
  </Sheet>;
}