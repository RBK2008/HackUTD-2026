import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, Building2, Check, Landmark, LoaderCircle, LockKeyhole, Pencil, Plus, RefreshCw, Send, Unplug, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { BankConnectionDialog } from "@/components/BankConnectionDialog";
import { CustomerCombobox } from "@/components/CustomerCombobox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { clearCoachChat, disconnectBank, reconnectBank, renameAccount, resetDemoData, saveAlertSettings, selectCustomer, sendTestAlert, signOut, syncBank, useAllAccountDetails, useCustomer, useInstitutions } from "@/data/api";
import { sessionStore, useSession } from "@/data/session";
import { alertTypeOptions, formatUsPhone, phoneDigits, phoneFromE164, toPhoneE164 } from "@/lib/settings";
import { formatDate, formatCurrency } from "@/lib/format";
import type { AlertSettings } from "@/data/types";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Steady" },
    { name: "description", content: "Manage your demo profile, linked banks, account names, alerts, and privacy in Steady." },
    { property: "og:title", content: "Settings — Steady" },
    { property: "og:description", content: "Manage your financial profile, linked banks, alerts, and privacy in Steady." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SettingsPage,
});

const sections = [
  { id: "profile", label: "Profile & data", icon: UserRound },
  { id: "banks", label: "Linked banks & accounts", icon: Landmark },
  { id: "notifications", label: "Alerts & notifications", icon: Bell },
  { id: "privacy", label: "Privacy & AI", icon: LockKeyhole },
];
const times = Array.from({ length: 24 }, (_, hour) => ({ value: String(hour).padStart(2, "0") + ":00", label: `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}` }));

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-24 rounded-2xl border bg-card p-5 shadow-soft md:p-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p><div className="mt-6">{children}</div></section>;
}

function SettingsPage() {
  const navigate = useNavigate();
  const session = useSession();
  const customer = useCustomer();
  const [switchId, setSwitchId] = useState(session.selectedCustomerId ?? "");
  const [switching, setSwitching] = useState(false);
  async function switchDataset() {
    if (!switchId) return;
    setSwitching(true);
    try { await selectCustomer(switchId); toast.success("Demo dataset switched."); }
    finally { setSwitching(false); }
  }
  return <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
    <h1 className="text-2xl font-bold">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Manage your data, connections, alerts, and privacy.</p>
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto rounded-2xl border bg-card p-2 shadow-soft lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:p-3">{sections.map((section) => <button key={section.id} type="button" onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"><section.icon className="h-4 w-4" />{section.label}</button>)}</nav>
      <div className="min-w-0 space-y-6">
        <Section id="profile" title="Profile & data" description="Choose the sample profile used throughout the app.">
          <div className="rounded-xl bg-muted p-4"><p className="text-xs font-medium text-muted-foreground">Current mode</p><p className="mt-1 font-medium">{session.mode === "bank" ? "Connected bank" : `Demo dataset: ${customer.name}`}</p></div>
          <div className="mt-5 space-y-2"><Label htmlFor="switch-dataset">Switch dataset</Label><CustomerCombobox id="switch-dataset" value={switchId} onChange={setSwitchId} /></div>
          <div className="mt-4 flex flex-wrap gap-3">
            <AlertDialog><AlertDialogTrigger asChild><Button disabled={!switchId || switching}>Switch</Button></AlertDialogTrigger><AlertDialogContent className="bg-card"><AlertDialogHeader><AlertDialogTitle>Switch demo dataset?</AlertDialogTitle><AlertDialogDescription>Switching will reset alerts, linked banks, and your coach chat for this demo.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => void switchDataset()}>Switch dataset</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
            <Button variant="outline" onClick={() => { signOut(); void navigate({ to: "/signin" }); }}>Sign out</Button>
          </div>
        </Section>
        <LinkedBanksSettings />
        <NotificationSettings />
        <Section id="privacy" title="Privacy & AI" description="Understand what the coach receives and reset demo content.">
          <p className="text-sm leading-relaxed text-muted-foreground">Your coach uses Google Gemini. It receives summaries of your account data to answer questions. Numbers are calculated by our system, not by the AI.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Button variant="outline" onClick={() => { clearCoachChat(); toast.success("Coach chat history cleared."); }}>Clear coach chat history</Button>
            <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" className="text-risk">Reset demo</Button></AlertDialogTrigger><AlertDialogContent className="bg-card"><AlertDialogHeader><AlertDialogTitle>Reset the demo?</AlertDialogTitle><AlertDialogDescription>This restores the original alerts, linked banks, nicknames, and coach chat.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { resetDemoData(); toast.success("Demo reset to its original state."); }}>Reset demo</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
          </div>
        </Section>
      </div>
    </div>
  </div>;
}

function LinkedBanksSettings() {
  const institutions = useInstitutions();
  const accounts = useAllAccountDetails();
  const session = useSession();
  const [renameId, setRenameId] = useState<string>();
  const [nickname, setNickname] = useState("");
  const renaming = accounts.find((account) => account.id === renameId);
  return <Section id="banks" title="Linked banks & accounts" description="Sync, rename, reconnect, or remove your demo connections.">
    <div className="space-y-4">{institutions.map((bank) => <article key={bank.id} className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{bank.name}</h3><span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{bank.source === "pnc" ? "PNC" : "via Plaid"}</span></div><p className="mt-1 flex items-center gap-1.5 text-xs capitalize text-muted-foreground">{bank.status === "syncing" && <LoaderCircle className="h-3 w-3 motion-safe:animate-spin" />}{bank.status.replace("_", " ")} · Last synced {bank.lastSynced ? formatDate(bank.lastSynced.slice(0, 10)) : "not yet"}</p></div>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={bank.status === "syncing"} onClick={() => void syncBank(bank.id).then(() => toast.success(`${bank.name} synced.`))}><RefreshCw />Sync now</Button>{bank.status === "needs_reauth" && <Button size="sm" variant="outline" onClick={() => void reconnectBank(bank.id)}>Reconnect</Button>}
          <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-risk"><Unplug />Disconnect</Button></AlertDialogTrigger><AlertDialogContent className="bg-card"><AlertDialogHeader><AlertDialogTitle>Disconnect {bank.name}?</AlertDialogTitle><AlertDialogDescription>Its accounts will be removed from this demo. You can connect again later.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { disconnectBank(bank.id); sessionStore.removeConnectedItem(bank.name); toast.success(`${bank.name} disconnected.`); }}>Disconnect</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div></div>
      <ul className="mt-4 divide-y rounded-lg bg-muted/60 px-3">{accounts.filter((account) => account.institutionId === bank.id).map((account) => <li key={account.id} className="flex items-center gap-3 py-3"><Wallet className="h-4 w-4 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{account.label}</p><p className="font-serif text-sm text-muted-foreground">{formatCurrency(account.balance)}</p></div><Button variant="ghost" size="icon" aria-label={`Rename ${account.label}`} onClick={() => { setRenameId(account.id); setNickname(account.label); }}><Pencil /></Button></li>)}</ul>
    </article>)}</div>
    <BankConnectionDialog trigger={<Button variant="outline" className="mt-4 w-full border-dashed"><Plus />Add another bank</Button>} />
    {session.connectedItems.length > 0 && <div className="mt-6"><h3 className="text-sm font-semibold">Connected items</h3><ul className="mt-2 space-y-2">{session.connectedItems.map((item) => <li key={item.itemId} className="rounded-lg bg-muted p-3 text-sm"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><span className="font-medium">{item.institutionName}</span></div><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{item.itemId}</p><p className="mt-1 text-xs text-muted-foreground">Connected {formatDate(item.connectedAt.slice(0, 10))}</p></li>)}</ul></div>}
    <Dialog open={Boolean(renameId)} onOpenChange={(open) => { if (!open) setRenameId(undefined); }}><DialogContent className="bg-card"><DialogHeader><DialogTitle>Rename account</DialogTitle><DialogDescription>This nickname will appear everywhere in the app.</DialogDescription></DialogHeader><Label htmlFor="account-nickname">Nickname</Label><Input id="account-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={50} /><DialogFooter><Button variant="outline" onClick={() => setRenameId(undefined)}>Cancel</Button><Button disabled={!nickname.trim()} onClick={() => { if (renameId) renameAccount(renameId, nickname); toast.success(`${renaming?.label ?? "Account"} renamed.`); setRenameId(undefined); }}>Save nickname</Button></DialogFooter></DialogContent></Dialog>
  </Section>;
}

function NotificationSettings() {
  const session = useSession();
  const [settings, setSettings] = useState<AlertSettings>(session.alertSettings);
  const [phone, setPhone] = useState(phoneFromE164(session.alertSettings.phoneE164));
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const digits = phoneDigits(phone);
  const validPhone = digits.length === 10;
  const phoneError = digits.length > 0 && !validPhone ? "Enter a 10-digit US phone number." : digits.length > 0 && !settings.consent ? "Consent is required before saving a phone number." : "";
  const canUsePhone = validPhone && settings.consent;
  function patch(next: Partial<AlertSettings>) { setSettings((current) => ({ ...current, ...next })); }
  async function testAlert() {
    setSending(true);
    try { await sendTestAlert(toPhoneE164(phone)); toast.success(`Test alert sent to ${formatUsPhone(phone)}`); }
    finally { setSending(false); }
  }
  async function save() {
    setSaving(true);
    try { await saveAlertSettings({ ...settings, phoneE164: toPhoneE164(phone) }); toast.success("Alert settings saved"); }
    finally { setSaving(false); }
  }
  return <Section id="notifications" title="Alerts & notifications" description="Choose what Steady sends and where it goes. No real texts are sent in this demo.">
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="space-y-2"><Label htmlFor="alert-phone">Phone number for iMessage alerts</Label><div className="flex"><span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm">+1</span><Input id="alert-phone" inputMode="numeric" autoComplete="tel-national" placeholder="(555) 123-4567" value={phone} onChange={(event) => setPhone(formatUsPhone(event.target.value))} className="rounded-l-none" aria-describedby="phone-error" /></div>{phoneError && <p id="phone-error" role="alert" className="text-xs text-risk">{phoneError}</p>}</div><Button variant="outline" disabled={!canUsePhone || sending} onClick={() => void testAlert()}>{sending ? <LoaderCircle className="motion-safe:animate-spin" /> : <Send />}Send test alert</Button></div>
    <div className="mt-4 flex items-start gap-3"><Checkbox id="alert-consent" checked={settings.consent} onCheckedChange={(checked) => patch({ consent: checked === true })} /><Label htmlFor="alert-consent" className="text-sm font-normal leading-relaxed">I agree to receive financial alerts by text message. Reply STOP to unsubscribe.</Label></div>
    <div className="mt-6 space-y-4"><h3 className="text-sm font-semibold">Channels</h3><SettingToggle id="channel-app" label="In the app" checked disabled onChange={() => undefined} /><SettingToggle id="channel-imessage" label="iMessage" checked={settings.channels.imessage} onChange={(checked) => patch({ channels: { app: true, imessage: checked } })} /></div>
    <div className="mt-6"><h3 className="text-sm font-semibold">Alert types</h3><div className="mt-2 divide-y">{alertTypeOptions.map((type) => <div key={type.key} className="flex items-center justify-between gap-4 py-3"><div><Label htmlFor={`type-${type.key}`}>{type.label}</Label><p className="mt-0.5 text-xs text-muted-foreground">{type.description}</p></div><Switch id={`type-${type.key}`} checked={settings.alertTypes[type.key]} onCheckedChange={(checked) => patch({ alertTypes: { ...settings.alertTypes, [type.key]: checked } })} /></div>)}</div></div>
    <div className="mt-5 grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="phone-severity">Send to my phone</Label><Select value={settings.phoneSeverity} onValueChange={(value: AlertSettings["phoneSeverity"]) => patch({ phoneSeverity: value })}><SelectTrigger id="phone-severity"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="critical">Critical only</SelectItem><SelectItem value="critical_warning">Critical and warnings</SelectItem><SelectItem value="all">All alerts</SelectItem></SelectContent></Select></div></div>
    <div className="mt-6 rounded-xl bg-muted p-4"><SettingToggle id="hide-amounts" label="Hide dollar amounts in phone alerts" checked={settings.hideAmounts} onChange={(checked) => patch({ hideAmounts: checked })} /><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Alerts can appear on your lock screen. When on, we'll say 'Your card is over its limit' instead of showing the balance.</p></div>
    <div className="mt-5 rounded-xl border p-4"><SettingToggle id="quiet-hours" label="Quiet hours" checked={settings.quietHours.enabled} onChange={(checked) => patch({ quietHours: { ...settings.quietHours, enabled: checked } })} /><div className="mt-3 grid grid-cols-2 gap-3"><TimeSelect id="quiet-start" label="Start" value={settings.quietHours.start} disabled={!settings.quietHours.enabled} onChange={(start) => patch({ quietHours: { ...settings.quietHours, start } })} /><TimeSelect id="quiet-end" label="End" value={settings.quietHours.end} disabled={!settings.quietHours.enabled} onChange={(end) => patch({ quietHours: { ...settings.quietHours, end } })} /></div><p className="mt-3 text-xs text-muted-foreground">Critical alerts are still sent during quiet hours.</p></div>
    <Button className="mt-6" disabled={saving || Boolean(phoneError)} onClick={() => void save()}>{saving ? <LoaderCircle className="motion-safe:animate-spin" /> : <Check />}Save alert settings</Button>
  </Section>;
}

function SettingToggle({ id, label, checked, disabled, onChange }: { id: string; label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4"><Label htmlFor={id}>{label}</Label><Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} /></div>;
}
function TimeSelect({ id, label, value, disabled, onChange }: { id: string; label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Select value={value} disabled={disabled} onValueChange={onChange}><SelectTrigger id={id}><SelectValue /></SelectTrigger><SelectContent>{times.map((time) => <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>)}</SelectContent></Select></div>;
}
