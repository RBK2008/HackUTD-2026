import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { AlertSettings, ConnectedItem } from "./types";
import { defaultAlertSettings } from "@/lib/settings";

export type SessionMode = "demo" | "bank" | null;
export type SessionState = {
  mode: SessionMode;
  selectedCustomerId: string | null;
  connectedItems: ConnectedItem[];
  alertSettings: AlertSettings;
  hydrated: boolean;
};

const STORAGE_KEY = "steady-demo-session-v1";
const signedOut: SessionState = { mode: null, selectedCustomerId: null, connectedItems: [], alertSettings: defaultAlertSettings, hydrated: false };
let state = signedOut;
const listeners = new Set<() => void>();

function publish(next: SessionState, persist = true) {
  state = next;
  if (persist && next.hydrated) {
    try {
      const { hydrated: _hydrated, ...saved } = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // The in-memory session remains usable when storage is unavailable.
    }
  }
  listeners.forEach((listener) => listener());
}

function validSavedSession(value: unknown): value is Omit<SessionState, "hydrated"> {
  if (!value || typeof value !== "object") return false;
  const saved = value as Partial<SessionState>;
  return (saved.mode === "demo" || saved.mode === "bank") && typeof saved.selectedCustomerId === "string" && Array.isArray(saved.connectedItems);
}

export const sessionStore = {
  getSnapshot: () => state,
  getServerSnapshot: () => signedOut,
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  initialize() {
    let restored: SessionState = { ...signedOut, hydrated: true };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validSavedSession(parsed)) restored = { ...parsed, alertSettings: parsed.alertSettings ?? defaultAlertSettings, hydrated: true };
      }
    } catch {
      // Ignore unavailable or malformed storage and start signed out in memory.
    }
    publish(restored);
  },
  selectCustomer(id: string) {
    publish({ ...state, mode: "demo", selectedCustomerId: id, connectedItems: [], hydrated: true });
  },
  completeConnection(item: ConnectedItem, bankSignIn = false) {
    const connectedItems = [...state.connectedItems.filter((existing) => existing.itemId !== item.itemId), item];
    publish({
      ...state,
      ...(bankSignIn || !state.mode ? { mode: "bank" as const, selectedCustomerId: "C024" } : {}),
      connectedItems,
      hydrated: true,
    });
  },
  removeConnectedItem(institutionName: string) {
    publish({ ...state, connectedItems: state.connectedItems.filter((item) => item.institutionName !== institutionName) });
  },
  clearConnectedItems() { publish({ ...state, connectedItems: [] }); },
  saveAlertSettings(alertSettings: AlertSettings) { publish({ ...state, alertSettings }); },
  signOut() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* Memory is still cleared. */ }
    publish({ ...signedOut, hydrated: true }, false);
  },
};

const SessionContext = createContext<SessionState>(signedOut);
export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => { sessionStore.initialize(); }, []);
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, sessionStore.getServerSnapshot);
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
export function useSession() { return useContext(SessionContext); }
