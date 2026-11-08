import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AccountCard } from "@/components/AccountCard";
import { AccountDetail } from "@/components/AccountDetail";
import { LinkedBanks } from "@/components/LinkedBanks";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { selectInstitution, useAccountDetails, useInstitutions, useSelectedInstitution, useAccountsSummary } from "@/data/api";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Steady" },
      { name: "description", content: "Explore everything you have and owe, with account histories, recent activity, and demo payoff estimates in Steady." },
      { property: "og:title", content: "Accounts — Steady" },
      { property: "og:description", content: "Your accounts, balance histories, recent activity, and payoff estimates in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accounts,
});

function Accounts() {
  const accounts = useAccountDetails();
  const institutions = useInstitutions();
  const activeBank = useSelectedInstitution();
  const filtered = accounts;
  const summary = useAccountsSummary(activeBank);
  const [selected, setSelected] = useState<string>();
  return <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-8">
    <header><div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Accounts</h1><span className="flex items-center gap-1.5 text-xs font-semibold text-good"><span className="h-2 w-2 rounded-full bg-good motion-safe:animate-pulse" />Live</span></div><p className="mt-1 text-sm text-muted-foreground">Everything you have and owe, in one place.</p></header>
    <LinkedBanks institutions={institutions} />
    <section aria-label="Account summary">
      <ToggleGroup type="single" value={activeBank} onValueChange={(value) => { if (value) selectInstitution(value); }} aria-label="Select bank" className="mb-4 w-fit max-w-full flex-wrap justify-start rounded-lg bg-card p-1">
        {[{ id: "all", name: "All banks" }, ...institutions].map((item) => <ToggleGroupItem key={item.id} value={item.id} className="h-auto min-h-9 whitespace-normal px-3 py-2 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{item.name}</ToggleGroupItem>)}
      </ToggleGroup>
      <div className="grid gap-3 sm:grid-cols-3">{[{ label: "What you have", value: summary?.totalAssets }, { label: "What you owe", value: summary?.totalDebts }, { label: "Monthly debt payments", value: summary?.totalMonthlyDebtPayments }].map((stat) => <div key={stat.label} className="rounded-lg border bg-card px-4 py-5 text-center shadow-soft"><h2 className="text-sm font-semibold text-muted-foreground">{stat.label}</h2><p className="mt-2 font-serif text-3xl font-semibold">{stat.value === undefined ? "—" : formatCurrency(stat.value)}</p></div>)}</div>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">Home and car values aren't included in this data, so we don't show net worth.</p>
    </section>
    {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No account data available for this selection.</p>}
    {[{ label: "What you have", debt: false }, { label: "What you owe", debt: true }].map((section) => <section key={section.label}><h2 className="mb-4 text-center text-lg font-semibold">{section.label}</h2><div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.filter((account) => account.debt === section.debt).map((account) => <AccountCard key={account.id} account={account} bankName={activeBank === "all" ? institutions.find((bank) => bank.id === account.institutionId)?.name : undefined} onOpen={() => setSelected(account.id)} />)}</div></section>)}
    <AccountDetail account={accounts.find((account) => account.id === selected)} onClose={() => setSelected(undefined)} />
  </div>;
}
