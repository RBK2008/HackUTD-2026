import { ArrowDownRight, ArrowUpRight, Car, CreditCard, HandCoins, Home, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountHistory } from "@/components/AccountHistory";
import type { AccountType } from "@/data/types";
import type { AccountView } from "@/lib/accounts";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const accountIcons: Record<AccountType, typeof Wallet> = { checking: Wallet, savings: PiggyBank, ira: TrendingUp, credit_card: CreditCard, auto_loan: Car, personal_loan: HandCoins, mortgage: Home };

export function AccountCard({ account, onOpen, bankName, arriving }: { account: AccountView; onOpen: () => void; bankName?: string | undefined; arriving?: boolean }) {
  const Icon = accountIcons[account.type];
  const Arrow = account.changeDirection === "down" ? ArrowDownRight : ArrowUpRight;
  return <Button variant="ghost" onClick={onOpen} aria-label={`View ${account.label} account`} className={cn("h-full min-w-0 flex-col justify-start gap-0 whitespace-normal rounded-lg border bg-card p-5 text-center shadow-soft hover:bg-card hover:ring-1 hover:ring-primary [&_svg]:size-auto", arriving && "account-arrival")}>
    <Icon className="mb-3 h-6 w-6 text-primary" />
    <h3 className="font-serif text-xl font-semibold">{account.label}</h3>
    {bankName && <p className="mt-1 text-xs text-muted-foreground">{bankName}</p>}
    <p className="mt-2 font-serif text-3xl font-semibold">{formatCurrency(account.balance)}</p>
    <p className="mt-1 font-serif text-base text-muted-foreground">{account.rateLabel}</p>
    <div className="mt-4 w-full"><AccountHistory account={account} compact /></div>
    <p className={cn("mt-2 flex items-center justify-center gap-1 text-xs", account.changeTone === "good" ? "text-good" : account.changeTone === "bad" ? "text-risk" : "text-muted-foreground")}><Arrow className="h-4 w-4 shrink-0" /><span><span className="font-serif text-sm">{account.changeLabel}</span>{account.changeTone === "bad" && <span className="ml-1 font-semibold">· Rising</span>}</span></p>
    {account.type === "credit_card" && <div className="mt-4 w-full">
      <div className="relative h-2.5 rounded-sm bg-muted" role="progressbar" aria-label="Credit limit usage" aria-valuenow={account.usagePercent} aria-valuemin={0} aria-valuemax={200}>
        <div className={cn("h-full rounded-sm", account.overLimit ? "bg-risk" : "bg-primary")} style={{ width: account.usageWidth }} />
        <span className="absolute top-[-3px] h-4 border-l-2 border-foreground" style={{ left: account.limitWidth }} />
      </div>
      <p className={cn("mt-2 font-serif text-base", account.usageTone === "bad" ? "text-risk" : "text-good")}>{formatPercent(account.utilization ?? 0)} of limit{account.overLimit && ", over limit"}</p>
    </div>}
  </Button>;
}