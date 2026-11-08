import { useSyncExternalStore, type ReactNode } from "react";
import type { Institution } from "./types";

const pncInstitution: Institution = {
  id: "inst_pnc",
  name: "PNC Bank",
  source: "pnc",
  status: "synced",
  lastSynced: "",
};

const initialState = {
  institutions: [pncInstitution],
  selectedInstitutionId: "all",
  nicknames: {} as Record<string, string>,
};

let state = initialState;
const listeners = new Set<() => void>();

function publish(next: typeof state) {
  state = next;
  for (const listener of listeners) listener();
}

export const accountsStore = {
  getSnapshot: () => state,
  getServerSnapshot: () => initialState,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  selectInstitution(id: string) {
    if (id === "all" || state.institutions.some((institution) => institution.id === id)) {
      publish({ ...state, selectedInstitutionId: id });
    }
  },
  reconnectBank(id: string) {
    if (id === pncInstitution.id) publish({ ...state, institutions: [pncInstitution] });
  },
  async syncBank(id: string) {
    if (id !== pncInstitution.id || !state.institutions.length) return;
    const { getSteadyConnection } = await import("./steady-connection");
    await getSteadyConnection();
  },
  renameAccount(id: string, nickname: string) {
    const value = nickname.trim();
    if (value) publish({ ...state, nicknames: { ...state.nicknames, [id]: value } });
  },
  disconnectBank(id: string) {
    if (id === pncInstitution.id) publish({ ...state, institutions: [], selectedInstitutionId: "all" });
  },
  reset() {
    publish(initialState);
  },
};

export function AccountsProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useAccountsStore() {
  return useSyncExternalStore(accountsStore.subscribe, accountsStore.getSnapshot, accountsStore.getServerSnapshot);
}
