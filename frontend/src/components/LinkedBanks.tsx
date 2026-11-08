import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, MoreHorizontal, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BankConnectionDialog } from "@/components/BankConnectionDialog";
import { disconnectBank, reconnectBank } from "@/data/api";
import type { Institution } from "@/data/types";
import { sessionStore } from "@/data/session";
import { formatRelativeTime } from "@/lib/format";

export function LinkedBanks({ institutions }: { institutions: Institution[] }) {
  const [now, setNow] = useState<number>();
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  return <section aria-label="Linked banks"><h2 className="mb-3 text-sm font-semibold">Linked banks</h2><div className="flex flex-wrap items-stretch gap-3">
    {institutions.map((bank) => <div key={bank.id} className="flex min-w-0 max-w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-soft">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{bank.name}</span><span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{bank.source === "pnc" ? "PNC" : "via Plaid"}</span></div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" role="status">
          {bank.status === "synced" && <><span className="h-1.5 w-1.5 rounded-full bg-good" />Updated {formatRelativeTime(bank.lastSynced, now)}</>}
          {bank.status === "syncing" && <><LoaderCircle className="h-3 w-3 motion-safe:animate-spin text-primary" />Syncing…</>}
          {bank.status === "needs_reauth" && <><AlertCircle className="h-3 w-3 text-watch" />Reconnect needed<Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => void reconnectBank(bank.id)}>Reconnect</Button></>}
          {bank.status === "error" && <><AlertCircle className="h-3 w-3 text-risk" />Sync failed<Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => void reconnectBank(bank.id)}>Retry</Button></>}
        </div>
      </div>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Manage ${bank.name}`} title={`Manage ${bank.name}`} disabled={bank.status === "syncing"}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="text-risk" onSelect={() => { disconnectBank(bank.id); sessionStore.removeConnectedItem(bank.name); toast.success(`${bank.name} disconnected.`); }}><Unplug />Disconnect</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div>)}
    <BankConnectionDialog />
  </div></section>;
}