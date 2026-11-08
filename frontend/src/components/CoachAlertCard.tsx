import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEVERITY } from "@/components/Status";
import type { Alert } from "@/data/types";
import { cn } from "@/lib/utils";

export function CoachAlertCard({ alert, onAsk }: { alert: Alert; onAsk?: (alert: Alert) => void }) {
  const severity = SEVERITY[alert.severity];
  return (
    <article className={cn("rounded-lg border p-4", severity.cls)}>
      <div className="flex items-center gap-2 text-xs font-semibold"><severity.icon className="h-4 w-4" />{severity.label}{!alert.read && <span className="ml-auto">Unread</span>}</div>
      <h3 className="mt-2 text-sm font-semibold text-foreground">{alert.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{alert.reason}</p>
      <p className="mt-2 text-sm text-foreground">{alert.suggestedAction}</p>
      {onAsk ? (
        <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={() => onAsk(alert)}><MessageCircle />Ask about this</Button>
      ) : (
        <Button asChild variant="ghost" size="sm" className="mt-3 text-primary"><Link to="/coach" search={{ alertId: alert.id }}><MessageCircle />Ask about this</Link></Button>
      )}
    </article>
  );
}