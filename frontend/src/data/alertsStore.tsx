import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { toast } from "sonner";
import { mockData } from "./mock";
import { useSession } from "./session";
import { updateSteadyAlert, useSteadyCatalog } from "./steady-catalog";
import type { Alert } from "./types";

type AlertsState = { alerts: Alert[]; usedDemoIds: string[] };

type AlertsAction =
  | { type: "read" | "dismiss"; id: string }
  | { type: "readAll" | "resetDemo" | "resetAll" | "clearLocal" }
  | { type: "add"; alert: Alert };

export function alertsReducer(state: AlertsState, action: AlertsAction): AlertsState {
  switch (action.type) {
    case "read":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.id ? { ...alert, read: true } : alert,
        ),
      };
    case "readAll":
      return { ...state, alerts: state.alerts.map((alert) => ({ ...alert, read: true })) };
    case "dismiss":
      return { ...state, alerts: state.alerts.filter((alert) => alert.id !== action.id) };
    case "resetDemo":
      return { alerts: state.alerts.filter((alert) => !alert.isDemo), usedDemoIds: [] };
    case "resetAll":
      return { alerts: mockData.alerts, usedDemoIds: [] };
    case "clearLocal":
      return { alerts: [], usedDemoIds: [] };
    case "add":
      if (
        state.alerts.some((alert) => alert.id === action.alert.id) ||
        (action.alert.isDemo && state.usedDemoIds.includes(action.alert.id))
      ) {
        return state;
      }
      return {
        alerts: [action.alert, ...state.alerts],
        usedDemoIds: action.alert.isDemo
          ? [...state.usedDemoIds, action.alert.id]
          : state.usedDemoIds,
      };
  }
}

type AlertsStore = AlertsState & {
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  addAlert: (alert: Alert) => void;
  resetDemo: () => void;
  resetAll: () => void;
};

const AlertsContext = createContext<AlertsStore | undefined>(undefined);
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function monthEnd(month: string) {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { data } = useSteadyCatalog();
  const { selectedCustomerId } = useSession();
  const [state, dispatch] = useReducer(alertsReducer, { alerts: [], usedDemoIds: [] });

  const liveAlerts: Alert[] = (data?.alerts ?? [])
    .filter((alert) => alert.customerId === selectedCustomerId)
    .map((alert) => ({
      id: alert.id,
      title: alert.title,
      severity: "warning",
      reason: `Your credit card closing balance increased by ${dollars.format(
        Number(alert.increaseCents) / 100,
      )} compared with the previous month.`,
      suggestedAction: "Review your credit card activity in Accounts.",
      date: monthEnd(alert.month),
      read: alert.read,
      channels: ["app"],
    }));

  useEffect(() => {
    const reset = () => dispatch({ type: "clearLocal" });
    window.addEventListener("steady:reset-all", reset);
    return () => window.removeEventListener("steady:reset-all", reset);
  }, []);

  function saveLiveAction(id: string, status: "read" | "dismissed") {
    return updateSteadyAlert(id, status).catch(() => {
      toast.error("Could not update the alert. Please try again.");
    });
  }

  const store: AlertsStore = {
    ...state,
    alerts: [...liveAlerts, ...state.alerts],
    markAsRead: (id) => {
      if (liveAlerts.some((alert) => alert.id === id)) {
        void saveLiveAction(id, "read");
      } else {
        dispatch({ type: "read", id });
      }
    },
    markAllAsRead: () => {
      dispatch({ type: "readAll" });
      for (const alert of liveAlerts) {
        if (!alert.read) void saveLiveAction(alert.id, "read");
      }
    },
    dismiss: (id) => {
      if (liveAlerts.some((alert) => alert.id === id)) {
        void saveLiveAction(id, "dismissed");
      } else {
        dispatch({ type: "dismiss", id });
      }
    },
    addAlert: (alert) => dispatch({ type: "add", alert }),
    resetDemo: () => dispatch({ type: "resetDemo" }),
    resetAll: () => dispatch({ type: "clearLocal" }),
  };

  return <AlertsContext.Provider value={store}>{children}</AlertsContext.Provider>;
}

export function useAlertsStore() {
  const store = useContext(AlertsContext);
  if (!store) throw new Error("AlertsProvider is required");
  return store;
}