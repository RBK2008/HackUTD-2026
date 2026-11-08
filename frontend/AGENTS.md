<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- SessionProvider owns the local demo session, connected items, and saved alert settings; AppShell guards every screen except Sign-in, and shared-store reset events keep customer switches and demo resets synchronized without a backend.
- Settings and all bank-entry points reuse the same simulated connection dialog and data-access functions, so replacing the mock backend later does not change presentation boundaries.
- Health-metric charts receive finished chronological monthly ratios and visual measurements from data-access hooks; no frontend ratio or goal calculations, so backend fields remain authoritative.
- Coach replies go through sendCoachMessage in the data-access layer; the page holds transient conversation state so a future backend swap changes only the reply boundary.
- Alert-to-Coach navigation uses optional validated alertId search state and shared alert cards so all entry points send the same context-aware question.
- AlertsProvider owns transient app-wide alert state; all alert consumers use useAlertsStore, while useAlerts is only the initial data boundary, preventing divergent unread counts.
- Demo alert fixtures have stable event IDs shared with mock Coach replies; used demo IDs survive dismissal until reset so presentation events cannot be duplicated.
- AccountsProvider exposes one shared in-memory account store including bank selection; account-facing data hooks and Coach account replies filter through that selection while useAllAccounts remains unfiltered, so navigation and cross-page updates stay consistent. Details match by unique account ID.
- Mock backend fixtures contain finished summaries, changes, tones, utilization, payoff years, activity signs, and chart coordinates; data-access hooks select/join them without arithmetic so a real backend can replace fixtures.
- All financial and date display formatting lives in src/lib/format.ts; presentation helpers only join supplied fields and format text.
- Account-to-Coach navigation uses optional validated account search state and sends its question through the existing reply boundary, keeping chat behavior shared with alert entry points.
