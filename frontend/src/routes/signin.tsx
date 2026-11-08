import { toast } from "sonner";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, HeartPulse } from "lucide-react";
import { useState } from "react";
import { BankConnectionDialog } from "@/components/BankConnectionDialog";
import { CustomerCombobox } from "@/components/CustomerCombobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { selectCustomer } from "@/data/api";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [
    { title: "Sign in — Steady" },
    { name: "description", content: "Connect a simulated bank or explore Steady with a synthetic demo financial profile." },
    { property: "og:title", content: "Sign in — Steady" },
    { property: "og:description", content: "See your whole financial picture in one place with Steady." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  async function continueDemo() {
    if (!customerId) return;
    setLoading(true);
    try { await selectCustomer(customerId); await navigate({ to: "/" }); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not load the customer."); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
    <div className="w-full max-w-md">
      <section className="rounded-3xl border bg-card p-6 text-center shadow-soft md:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><HeartPulse className="h-8 w-8" /></div>
        <h1 className="text-3xl font-bold text-primary">Steady</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">See your whole financial picture in one place.</p>
        <div className="mt-8 space-y-6 text-left">
          <BankConnectionDialog bankSignIn onDone={() => void navigate({ to: "/" })} trigger={<Button className="h-12 w-full text-base"><Building2 />Connect your bank</Button>} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
          <div className="space-y-3"><Label htmlFor="demo-customer">Explore with demo data</Label><CustomerCombobox id="demo-customer" value={customerId} onChange={setCustomerId} /><Button variant="secondary" className="w-full" disabled={!customerId || loading} onClick={() => void continueDemo()}>{loading ? "Loading…" : "Continue"}</Button></div>
        </div>
      </section>
      <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">Demo datasets are synthetic, provided by PNC for this hackathon. No real financial data is used.</p>
    </div>
  </main>;
}
