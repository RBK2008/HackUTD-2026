import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Info, MessageCircle, RotateCcw, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CoachContext } from "@/components/CoachContext";
import { sendCoachMessage } from "@/data/api";
import { useAlertsStore } from "@/data/alertsStore";
import type { Alert, ChatMessage } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach")({
  validateSearch: z.object({ alertId: z.string().optional(), account: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Coach — Steady" },
      { name: "description", content: "Ask Steady's demo financial coach about your spending, accounts, and debt, with answers grounded in your data." },
      { property: "og:title", content: "Coach — Steady" },
      { property: "og:description", content: "Explore your accounts, spending, and debt with Steady's demo financial coach." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Coach,
});

const suggestions = [
  "What is my listed-account net worth?",
  "What was my spending last month?",
  "What are my monthly debt payments?",
  "Tell me about my Checking",
];
type DisplayMessage = ChatMessage & { verified?: boolean; failed?: boolean; retry?: PendingRequest };
type PendingRequest = { text: string; history: ChatMessage[]; context?: { alertId?: string } };

function Coach() {
  const { alertId, account } = Route.useSearch();
  const { alerts } = useAlertsStore();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const busy = useRef(false);
  const lastAlert = useRef<string | undefined>(undefined);
  const lastAccount = useRef<string | undefined>(undefined);
  const end = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const clear = () => { setMessages([]); setDraft(""); setWaiting(false); busy.current = false; };
    window.addEventListener("steady:clear-coach", clear);
    window.addEventListener("steady:reset-all", clear);
    return () => { window.removeEventListener("steady:clear-coach", clear); window.removeEventListener("steady:reset-all", clear); };
  }, []);

  const requestReply = useCallback(async (request: PendingRequest) => {
    if (busy.current) return;
    busy.current = true;
    setWaiting(true);
    try {
      const reply = await sendCoachMessage(request.text, request.history, request.context);
      if (mounted.current) setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: "coach", text: reply.reply, sources: reply.sources, verified: reply.verified, createdAt: new Date().toISOString() }]);
    } catch {
      if (mounted.current) setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: "coach", text: "Sorry, I couldn't answer that right now. Please try again.", failed: true, retry: request, createdAt: new Date().toISOString() }]);
    } finally {
      busy.current = false;
      if (mounted.current) setWaiting(false);
    }
  }, []);

  const send = useCallback((text: string, context?: { alertId?: string }) => {
    const trimmed = text.trim();
    if (!trimmed || busy.current) return;
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed, createdAt: new Date().toISOString() };
    const history = messages.filter((message) => !message.failed);
    setMessages((previous) => [...previous, user]);
    setDraft("");
    void requestReply({ text: trimmed, history, ...(context ? { context } : {}) });
  }, [messages, requestReply]);

  useEffect(() => {
    if (!alertId) { lastAlert.current = undefined; return; }
    if (lastAlert.current === alertId || busy.current) return;
    const alert = alerts.find((item) => item.id === alertId);
    lastAlert.current = alertId;
    if (alert) send(`Explain this alert: ${alert.title}`, { alertId });
  }, [alertId, alerts, send, waiting]);

  useEffect(() => {
    if (!account) { lastAccount.current = undefined; return; }
    if (lastAccount.current === account || busy.current) return;
    lastAccount.current = account;
    send(`Tell me about my ${account}`);
  }, [account, send, waiting]);

  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [messages, waiting]);
  const askAlert = (alert: Alert) => { if (busy.current) return; setInfoOpen(false); send(`Explain this alert: ${alert.title}`, { alertId: alert.id }); };

  return (
    <div className="mx-auto grid h-[calc(100dvh-124px)] max-w-6xl grid-cols-1 md:h-[calc(100dvh-64px)] lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="flex min-h-0 min-w-0 flex-col" aria-label="Coach chat">
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-5 md:px-8">
          <div><h1 className="text-2xl font-bold">Coach</h1><p className="mt-1 text-sm text-muted-foreground">Ask about your selected customer’s accounts, spending, and debt.</p></div>
          <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
            <SheetTrigger asChild><Button variant="secondary" size="sm" className="lg:hidden"><Info />Info</Button></SheetTrigger>
            <SheetContent className="w-[min(90vw,360px)] overflow-y-auto bg-card">
              <SheetHeader className="mb-6"><SheetTitle>What the coach can see</SheetTitle><SheetDescription className="sr-only">Your health indicators and unread alerts.</SheetDescription></SheetHeader>
              <CoachContext onAsk={askAlert} />
            </SheetContent>
          </Sheet>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 md:px-8" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
          {messages.length === 0 && (
            <div className="mx-auto flex h-full max-w-lg flex-col justify-center py-6">
              <MessageCircle className="mb-4 h-9 w-9 text-primary" />
              <p className="text-xl font-semibold">Let's look at your finances together.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {suggestions.map((question) => <Button key={question} variant="secondary" className="h-auto min-h-16 justify-start whitespace-normal border bg-card px-4 py-3 text-left leading-relaxed shadow-soft" onClick={() => send(question)} disabled={waiting}>{question}</Button>)}
              </div>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message) => (
              <article key={message.id} className={cn("w-fit max-w-[92%] break-words rounded-lg px-4 py-3 shadow-soft sm:max-w-[85%]", message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "border bg-card text-card-foreground")}>
                {message.role === "coach" && <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Coach response</p>}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                {(message.sources?.length ?? 0) > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{message.sources?.map((source) => <span key={source} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{source}</span>)}</div>}
                {message.verified && <span className="mt-3 inline-flex items-center gap-1 rounded-md bg-good-soft px-2 py-1 text-[11px] font-semibold text-good"><Check className="h-3 w-3" />Numbers checked</span>}
                {message.failed && <Button variant="ghost" size="sm" className="mt-2" disabled={waiting} onClick={() => {
                  const request = message.retry;
                  if (!request || busy.current) return;
                  setMessages((previous) => previous.filter((item) => item.id !== message.id));
                  void requestReply(request);
                }}><RotateCcw />Retry</Button>}
              </article>
            ))}
            {waiting && <div role="status" aria-label="Coach is typing" className="flex w-fit gap-1.5 rounded-lg border bg-card px-5 py-4">{[0, 1, 2].map((dot) => <span key={dot} className={cn("h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse", dot === 1 && "[animation-delay:150ms]", dot === 2 && "[animation-delay:300ms]")} />)}</div>}
          </div>
          <div ref={end} />
        </div>
        <form className="shrink-0 border-t bg-card px-4 py-3 md:px-8" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
          <div className="flex items-end gap-2">
            <Textarea aria-label="Ask your coach" placeholder="Ask your coach..." value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} className="max-h-32 min-h-14 resize-none" onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); }
            }} />
            <Button type="submit" disabled={waiting || !draft.trim()} className="h-14"><Send /><span className="hidden sm:inline">Send</span><span className="sr-only sm:hidden">Send</span></Button>
          </div>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">The coach explains your data. It does not give investment or product advice.</p>
        </form>
      </section>
      <aside className="hidden min-h-0 overflow-y-auto border-l bg-card p-5 lg:block">
        <h2 className="mb-5 text-center text-base font-semibold">What the coach can see</h2>
        <CoachContext onAsk={askAlert} />
      </aside>
    </div>
  );
}
