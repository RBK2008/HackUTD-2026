import { useEffect, useState } from "react";
import { tables } from "@/module_bindings";
import { getSteadyConnection } from "./steady-connection";

type SteadyTotals = {
  customerId: string;
  assetsCents: bigint;
  liabilitiesCents: bigint;
  netWorthCents: bigint;
  monthlyDebtPaymentsCents: bigint;
};

type SteadyTotalsState = {
  totals: SteadyTotals | null;
  error: string | null;
};

export function useSteadyTotals(): SteadyTotalsState {
  const [state, setState] = useState<SteadyTotalsState>({
    totals: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;

    function showError(error: unknown) {
      if (!active) return;

      setState({
        totals: null,
        error: error instanceof Error ? error.message : "Could not load account totals.",
      });
    }

    void getSteadyConnection()
      .then((connection) => {
        if (!active) return;

        const totalsView = connection.db.mySelectedPncTotals;

        function refresh() {
          queueMicrotask(() => {
            if (!active) return;

            setState({
              totals: Array.from(totalsView.iter())[0] ?? null,
              error: null,
            });
          });
        }

        totalsView.onInsert(refresh);
        totalsView.onDelete(refresh);

        const subscription = connection
          .subscriptionBuilder()
          .onApplied(refresh)
          .onError((context) => showError(context.event))
          .subscribe(tables.mySelectedPncTotals);

        cleanup = () => {
          totalsView.removeOnInsert(refresh);
          totalsView.removeOnDelete(refresh);
          subscription.unsubscribe();
        };
      })
      .catch(showError);

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return state;
}