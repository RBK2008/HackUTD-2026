import { useSyncExternalStore } from "react";
import { tables, type DbConnection } from "@/module_bindings";
import { getSteadyConnection } from "./steady-connection";

function readCatalog(connection: DbConnection) {
  const db = connection.db;

  return {
    customers: Array.from(db.pncCustomerOptions.iter()),
    profile: Array.from(db.mySelectedPncProfile.iter())[0] ?? null,
    totals: Array.from(db.mySelectedPncTotals.iter())[0] ?? null,
    accounts: Array.from(db.mySelectedPncAccounts.iter()),
    transactions: Array.from(db.mySelectedPncTransactions.iter()),
    statements: Array.from(db.mySelectedPncMonthlyStatements.iter()),
    months: Array.from(db.mySelectedPncMonthlySummary.iter()),
    alerts: Array.from(db.mySelectedPncAlerts.iter()),
    settings: Array.from(db.myDemoAlertSettings.iter())[0] ?? null,
  };
}

type CatalogState = {
  data: ReturnType<typeof readCatalog> | null;
  error: string | null;
};

const initialState: CatalogState = { data: null, error: null };
const listeners = new Set<() => void>();

let state = initialState;
let started = false;

function publish(next: CatalogState) {
  state = next;
  for (const listener of listeners) listener();
}

function startCatalogSubscription() {
  if (started) return;
  started = true;

  void getSteadyConnection()
    .then((connection) => {
      const db = connection.db;
      let ready = false;
      let refreshQueued = false;

      function refresh() {
        if (!ready || refreshQueued) return;
        refreshQueued = true;

        queueMicrotask(() => {
          refreshQueued = false;
          if (ready) {
            publish({ data: readCatalog(connection), error: null });
          }
        });
      }

      const views = [
        db.pncCustomerOptions,
        db.mySelectedPncProfile,
        db.mySelectedPncTotals,
        db.mySelectedPncAccounts,
        db.mySelectedPncTransactions,
        db.mySelectedPncMonthlyStatements,
        db.mySelectedPncMonthlySummary,
        db.mySelectedPncAlerts,
        db.myDemoAlertSettings,
      ];

      for (const view of views) {
        view.onInsert(refresh);
        view.onDelete(refresh);

        if ("onUpdate" in view && typeof view.onUpdate === "function") {
          view.onUpdate(refresh);
        }
      }

      connection
        .subscriptionBuilder()
        .onApplied(() => {
          ready = true;
          refresh();
        })
        .onError((context) => {
          ready = false;
          publish({
            data: null,
            error: context.event?.message ?? "Could not load Steady’s data.",
          });
        })
        .subscribe([
          tables.pncCustomerOptions,
          tables.mySelectedPncProfile,
          tables.mySelectedPncTotals,
          tables.mySelectedPncAccounts,
          tables.mySelectedPncTransactions,
          tables.mySelectedPncMonthlyStatements,
          tables.mySelectedPncMonthlySummary,
          tables.mySelectedPncAlerts,
          tables.myDemoAlertSettings,
        ]);
    })
    .catch((error: unknown) => {
      started = false;
      publish({
        data: null,
        error: error instanceof Error ? error.message : "Could not connect to Steady.",
      });
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  startCatalogSubscription();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return initialState;
}

export function useSteadyCatalog() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export async function saveSteadyAlertPreference(cardBalanceRising: boolean) {
  const connection = await getSteadyConnection();
  await connection.reducers.saveDemoAlertSettings({ cardBalanceRising });
}

export async function updateSteadyAlert(
  alertId: string,
  status: "unread" | "read" | "dismissed",
) {
  const connection = await getSteadyConnection();
  await connection.reducers.setSelectedPncAlertState({ alertId, status });
}