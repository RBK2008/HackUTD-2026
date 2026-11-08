import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { accountDetails, mockData } from "./mock";
import { platypusAccounts, platypusDetails, platypusInstitution, pncInstitution } from "./bankFixtures";
import type { Account, AccountDetail, Institution } from "./types";

export type AccountChange = { institution: Institution; addedAccountIds: string[] };
type AccountsState = { institutions: Institution[]; accounts: Account[]; details: AccountDetail[]; selectedInstitutionId: string };
const initialState = (): AccountsState => ({ institutions: [pncInstitution], accounts: mockData.accounts, details: accountDetails, selectedInstitutionId: "all" });

export function createAccountsStore() {
  let state = initialState();
  const serverSnapshot = initialState();
  let generation = 0;
  const listeners = new Set<() => void>();
  const changes = new Set<(change: AccountChange) => void>();
  const pending = new Map<string, Promise<void>>();
  const publish = () => listeners.forEach((callback) => callback());

  function sync(institution: Institution, accounts: Account[], details: AccountDetail[]) {
    const existing = state.institutions.find((item) => item.id === institution.id);
    if (existing?.status === "synced") return Promise.resolve();
    const inFlight = pending.get(institution.id);
    if (inFlight) return inFlight;
    const taskGeneration = generation;
    state = { ...state, institutions: [...state.institutions.filter((item) => item.id !== institution.id), { ...institution, status: "syncing" }] };
    publish();
    const task = new Promise<void>((resolve) => setTimeout(() => {
      if (taskGeneration !== generation || !state.institutions.some((item) => item.id === institution.id)) { pending.delete(institution.id); resolve(); return; }
      const added = accounts.filter((account) => !state.accounts.some((item) => item.id === account.id));
      const synced: Institution = { ...institution, status: "synced", lastSynced: new Date().toISOString() };
      state = { ...state, institutions: state.institutions.map((item) => item.id === institution.id ? synced : item), accounts: [...state.accounts, ...added], details: [...state.details, ...details.filter((detail) => !state.details.some((item) => item.id === detail.id))] };
      pending.delete(institution.id); publish();
      changes.forEach((callback) => callback({ institution: synced, addedAccountIds: added.map((item) => item.id) }));
      resolve();
    }, 2000));
    pending.set(institution.id, task);
    return task;
  }

  return {
    getSnapshot: () => state,
    getServerSnapshot: () => serverSnapshot,
    subscribe(callback: () => void) { listeners.add(callback); return () => { listeners.delete(callback); }; },
    subscribeToAccountChanges(callback: (change: AccountChange) => void) { changes.add(callback); return () => { changes.delete(callback); }; },
    connectBank: () => sync(platypusInstitution, platypusAccounts, platypusDetails),
    selectInstitution(id: string) {
      if (id !== "all" && !state.institutions.some((item) => item.id === id)) return;
      if (state.selectedInstitutionId === id) return;
      state = { ...state, selectedInstitutionId: id }; publish();
    },
    reconnectBank(id: string) { return id === pncInstitution.id ? sync(pncInstitution, mockData.accounts, accountDetails) : sync(platypusInstitution, platypusAccounts, platypusDetails); },
    syncBank(id: string) {
      const bank = state.institutions.find((item) => item.id === id);
      if (!bank || bank.status === "syncing") return Promise.resolve();
      const taskGeneration = generation;
      state = { ...state, institutions: state.institutions.map((item) => item.id === id ? { ...item, status: "syncing" as const } : item) }; publish();
      return new Promise<void>((resolve) => setTimeout(() => {
        if (taskGeneration === generation && state.institutions.some((item) => item.id === id)) {
          state = { ...state, institutions: state.institutions.map((item) => item.id === id ? { ...item, status: "synced" as const, lastSynced: new Date().toISOString() } : item) }; publish();
        }
        resolve();
      }, 1500));
    },
    renameAccount(id: string, nickname: string) {
      const trimmed = nickname.trim();
      if (!trimmed) return;
      state = { ...state, accounts: state.accounts.map((account) => account.id === id ? { ...account, nickname: trimmed } : account) }; publish();
    },
    disconnectBank(id: string) {
      generation += 1;
      state = { selectedInstitutionId: state.selectedInstitutionId === id ? "all" : state.selectedInstitutionId, institutions: state.institutions.filter((item) => item.id !== id), accounts: state.accounts.filter((item) => item.institutionId !== id), details: state.details.filter((item) => item.institutionId !== id) }; publish();
    },
    reset() { generation += 1; pending.clear(); state = initialState(); publish(); },
  };
}
export const accountsStore = createAccountsStore();
const AccountsContext = createContext(accountsStore);
export function AccountsProvider({ children }: { children: ReactNode }) {
  return <AccountsContext.Provider value={accountsStore}>{children}</AccountsContext.Provider>;
}
export function useAccountsStore() {
  const store = useContext(AccountsContext);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
