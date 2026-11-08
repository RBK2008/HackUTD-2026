import { useState, type ReactNode } from "react";
import { Building2, CheckCircle2, LoaderCircle, Plus, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectBank, createLinkToken, exchangePublicToken } from "@/data/api";
import { sessionStore } from "@/data/session";

const banks = ["First Platypus Bank", "Tartan Bank", "Houndstooth Bank", "Silicon Valley Test Bank"];
type Step = "intro" | "choose" | "signin" | "connecting" | "success" | "error";

function SimulationBadge() {
  return <span className="inline-flex w-fit items-center rounded-full bg-watch-soft px-2.5 py-1 text-xs font-semibold text-watch">Simulation</span>;
}

export function BankConnectionDialog({ trigger, bankSignIn = false, onDone }: { trigger?: ReactNode; bankSignIn?: boolean; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [search, setSearch] = useState("");
  const [bankName, setBankName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [itemId, setItemId] = useState("");
  const [starting, setStarting] = useState(false);

  function reset() {
    setStep("intro"); setSearch(""); setBankName(""); setUsername(""); setPassword(""); setItemId(""); setStarting(false);
  }
  function changeOpen(next: boolean) {
    if (!next && (step === "connecting" || starting)) return;
    setOpen(next);
    if (!next) reset();
  }
  async function begin() {
    setStarting(true);
    try { await createLinkToken(); setStep("choose"); }
    catch { setStep("error"); }
    finally { setStarting(false); }
  }
  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault();
    setUsername(""); setPassword(""); setStep("connecting");
    try {
      const result = await exchangePublicToken(`public-sandbox-mock-${Math.random().toString(36).slice(2)}`, bankName);
      const connectedAt = new Date().toISOString();
      sessionStore.completeConnection({ itemId: result.itemId, institutionName: bankName, connectedAt }, bankSignIn);
      setItemId(result.itemId);
      if (!bankSignIn) void connectBank().then(() => toast.success("Health indicators updated with First Platypus Bank"));
      setStep("success");
    } catch { setStep("error"); }
  }
  const filtered = banks.filter((bank) => bank.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger ?? <Button variant="outline" className="h-auto min-h-16 border-dashed bg-card px-4 py-3"><Plus />Connect a bank</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-card sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center justify-between gap-3"><SimulationBadge /><ShieldCheck className="h-5 w-5 text-primary" /></div>
          <DialogTitle>Simulated bank connection</DialogTitle>
          <DialogDescription>{step === "intro" ? "Connect your bank securely." : step === "success" ? `${bankName} connected` : "A frontend-only preview of the secure connection flow."}</DialogDescription>
        </DialogHeader>

        {step === "intro" && <>
          <p className="text-sm leading-relaxed text-muted-foreground">In the real app, you'll sign in through Plaid's secure window. We never see your bank password.</p>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => changeOpen(false)}>Cancel</Button><Button onClick={() => void begin()} disabled={starting}>{starting ? <><LoaderCircle className="motion-safe:animate-spin" />Starting…</> : "Continue"}</Button></div>
        </>}

        {step === "choose" && <div className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search banks" placeholder="Search banks…" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div>
          <div className="grid gap-2">{filtered.map((bank) => <button key={bank} type="button" className="flex items-center gap-3 rounded-xl border bg-background p-3 text-left font-medium transition-colors hover:border-primary" onClick={() => { setBankName(bank); setStep("signin"); }}><Building2 className="h-5 w-5 text-primary" />{bank}</button>)}</div>
          {filtered.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No banks found.</p>}
        </div>}

        {(step === "signin" || step === "connecting") && <div className="rounded-xl border bg-muted/60 p-4">
          <div className="mb-4 flex items-center justify-between gap-3"><span className="flex items-center gap-2 font-semibold"><Building2 className="h-5 w-5" />{bankName}</span><SimulationBadge /></div>
          {step === "signin" ? <form className="space-y-4" onSubmit={(event) => void submitCredentials(event)}>
            <div className="space-y-2"><Label htmlFor="simulated-username">Username</Label><Input id="simulated-username" autoComplete="off" value={username} onChange={(event) => setUsername(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="simulated-password">Password</Label><Input id="simulated-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
            <p className="text-xs text-muted-foreground">Test mode: use user_good / pass_good</p>
            <Button type="submit" className="w-full" disabled={!username || !password}>Sign in</Button>
          </form> : <div className="flex flex-col items-center gap-3 py-8 text-center" role="status"><LoaderCircle className="h-8 w-8 motion-safe:animate-spin text-primary" /><p className="font-medium">Connecting to {bankName}…</p></div>}
        </div>}

        {step === "success" && <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-good" /><p className="text-lg font-semibold">{bankName} connected</p>
          <p className="break-all rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">Item ID: {itemId}</p>
          <Button className="w-full" onClick={() => { changeOpen(false); onDone?.(); }}>Done</Button>
        </div>}

        {step === "error" && <div className="space-y-4"><p role="alert" className="text-sm text-risk">Something went wrong connecting to {bankName || "your bank"}. Please try again.</p><Button className="w-full" onClick={() => setStep("choose")}>Try again</Button></div>}
      </DialogContent>
    </Dialog>
  );
}
