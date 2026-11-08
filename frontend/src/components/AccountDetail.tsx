import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AccountHistory } from "@/components/AccountHistory";
import { accountIcons } from "@/components/AccountCard";
import type { AccountView } from "@/lib/accounts";
import { formatDate, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AccountDetail({ account, onClose }: { account: AccountView | undefined; onClose: () => void }) {
  const Icon = account ? accountIcons[account.type] : undefined;
  return <Sheet open={Boolean(account)} onOpenChange={(open) => { if (!open) onClose(); }}>
    <SheetContent className="w-full overflow-y-auto bg-card p-6 sm:max-w-xl sm:p-8">
      {account && <>
        <SheetHeader className="items-center text-center">
          {Icon && <Icon className="h-7 w-7 text-primary" />}
          <SheetTitle className="font-serif text-2xl">{account.label}</SheetTitle>
          <p className="font-serif text-4xl font-semibold">{formatCurrency(account.balance)}</p>
          <SheetDescription className="font-serif text-base">{account.rateLabel}</SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-7">
          <section><h3 className="mb-3 text-center font-semibold">Balance history</h3><p className="mb-2 text-center text-xs text-muted-foreground">November 2025 – October 2026</p><AccountHistory account={account} /></section>
          {account.payoff && <section className="rounded-lg bg-accent p-4 text-center"><h3 className="mb-2 font-semibold text-primary">Payoff estimate</h3><p className="font-serif text-lg leading-relaxed">{account.payoffLabel}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{account.payoff.assumption}</p></section>}
          <section><h3 className="mb-3 text-center font-semibold">Recent activity</h3><ul className="divide-y">
            {account.activity.map((item, index) => <li key={`${item.date}-${index}`} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="text-sm font-medium">{item.displayLabel}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(item.date)}</p></div><span className={cn("shrink-0 font-serif text-lg font-semibold", item.incoming ? "text-good" : "text-risk")}>{item.displayAmount}</span></li>)}
          </ul></section>
          <Button asChild className="h-auto min-h-10 w-full whitespace-normal py-3"><Link to="/coach" search={{ account: account.label }}><MessageCircle />Ask the coach about this account</Link></Button>
        </div>
      </>}
    </SheetContent>
  </Sheet>;
}