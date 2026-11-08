import { Link, Navigate, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LayoutDashboard, Wallet, AlertTriangle, MessageCircle, Settings, HeartPulse, ChevronDown, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { signOut, useCustomer } from "@/data/api";
import { useAlertsStore } from "@/data/alertsStore";
import { useSession } from "@/data/session";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const APP_NAME = "Steady";
const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/coach", label: "Coach", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const session = useSession();
  const customer = useCustomer();
  const navigate = useNavigate();
  const unread = useAlertsStore().alerts.filter((a) => !a.read).length;
  if (path === "/signin") return children;
  if (!session.hydrated) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading your financial picture…</div>;
  if (!session.mode) return <Navigate to="/signin" replace />;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2 text-lg font-bold text-primary"><HeartPulse className="h-6 w-6" /> {APP_NAME}</div>
        <nav className="flex flex-col gap-1">{nav.map((n) => <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground", path === n.to && "bg-accent text-accent-foreground")}><n.icon className="h-4 w-4" /> {n.label}</Link>)}</nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-8">
          <span className="hidden items-center gap-2 font-bold text-primary min-[480px]:flex md:hidden"><HeartPulse className="h-5 w-5" /> {APP_NAME}</span>
          <span className="rounded-full bg-watch-soft px-2.5 py-0.5 text-xs font-semibold text-watch">{session.mode === "bank" ? "Connected bank" : "Demo data"}</span>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <DropdownMenu><DropdownMenuTrigger className="flex min-w-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted sm:text-sm"><span className="max-w-24 truncate sm:max-w-none">{customer.name}</span><ChevronDown className="h-3.5 w-3.5 shrink-0" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to="/settings">Switch dataset</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => { signOut(); void navigate({ to: "/signin" }); }}><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            <Link to="/alerts" className="relative rounded-full p-2 hover:bg-muted" aria-label={`${unread} unread alerts`}><Bell className="h-5 w-5 text-foreground" />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-risk px-1 text-[11px] font-bold text-primary-foreground">{unread}</span>}</Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-card md:hidden">{nav.map((n) => <Link key={n.to} to={n.to} className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground", path === n.to && "text-primary")}><n.icon className="h-5 w-5" /> {n.label}</Link>)}</nav>
    </div>
  );
}

export function ComingSoon({ title }: { title: string }) {
  return <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center"><div className="mb-4 rounded-2xl bg-accent p-4 text-primary"><HeartPulse className="h-8 w-8" /></div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-2 text-muted-foreground">Coming soon.</p></div>;
}
