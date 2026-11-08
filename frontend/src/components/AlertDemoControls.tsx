import { useRef, useState } from "react";
import { Check, ChevronDown, FlaskConical, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { injectDemoEvent } from "@/data/api";
import { demoEvents } from "@/data/demoAlerts";
import { useAlertsStore } from "@/data/alertsStore";

export function AlertDemoControls({ onAdded }: { onAdded: (id: string) => void }) {
  const { addAlert, usedDemoIds, resetDemo } = useAlertsStore();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const inFlight = useRef(new Set<string>());
  const inject = async (type: string) => {
    if (inFlight.current.has(type) || usedDemoIds.includes(`demo-${type}`)) return;
    inFlight.current.add(type); setPending([...inFlight.current]);
    try { const alert = await injectDemoEvent(type); addAlert(alert); onAdded(alert.id); toast.success(`New alert: ${alert.title}`); }
    catch { toast.error("Couldn't add the demo alert. Please try again."); }
    finally { inFlight.current.delete(type); setPending([...inFlight.current]); }
  };
  return <section className="rounded-lg border bg-card shadow-soft">
    <Button variant="ghost" className="h-auto w-full justify-between px-5 py-4" aria-expanded={open} aria-controls="demo-controls" onClick={() => setOpen(!open)}><span className="flex items-center gap-2"><FlaskConical />Demo controls</span><ChevronDown className={open ? "rotate-180" : ""} /></Button>
    {open && <div id="demo-controls" className="border-t px-5 pb-5 pt-4"><p className="mb-4 text-xs text-muted-foreground">Simulate events to show how alerts work. Demo data only.</p>
      <div className="flex flex-wrap gap-2">{demoEvents.map((event) => { const added = usedDemoIds.includes(`demo-${event.type}`); const loading = pending.includes(event.type); return <Button key={event.type} variant="secondary" disabled={added || loading} onClick={() => void inject(event.type)}>{loading ? <LoaderCircle className="motion-safe:animate-spin" /> : added ? <Check /> : null}{event.label}{added && <span>· Added</span>}</Button>; })}</div>
      <Button variant="link" size="sm" className="mt-3 px-0" disabled={pending.length > 0 || usedDemoIds.length === 0} onClick={resetDemo}>Reset demo</Button>
    </div>}
  </section>;
}