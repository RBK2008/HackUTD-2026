# Steady · HackUTD 2026

Steady shows a financial snapshot for three selected accounts from PNC's synthetic dataset. The Accounts page reads its **PNC account snapshot** from SpacetimeDB. The existing dashboard charts, account history, Coach, alerts, and bank connection are separate frontend demos.

## Run the website on Windows

Use PowerShell with Node.js 24 and Git installed. These commands install the frontend using its committed Bun lockfile and launch Vite.

```powershell
git clone https://github.com/RBK2008/HackUTD-2026.git
cd HackUTD-2026\frontend
npm.cmd exec --yes --package=bun -- bun install --frozen-lockfile
npm.cmd run dev
```

Open the local URL Vite prints, go to **Accounts**, and click **Load demo**. Expect three accounts and **$12,449.14** in net worth for those accounts. The app connects to `wss://maincloud.spacetimedb.com` using database `steady-ylqvp`. To point the website at another database, copy `frontend/.env.example` to `frontend/.env.local` and update its two public settings.

## Backend and bindings

The TypeScript module is in `spacetimedb/src/index.ts`. Its account and profile tables are private. The two client views are scoped to the caller's identity. The demo reducer is safe to call repeatedly for the same identity.

With SpacetimeDB CLI 2.14.1 installed, run these commands from the repository root after editing the module.

```powershell
npm.cmd --prefix spacetimedb ci
spacetime generate --lang typescript --out-dir frontend/src/module_bindings --module-path spacetimedb
```

For a local database, start `spacetime start` in another terminal, then run `spacetime publish steady-ylqvp --server local --module-path spacetimedb` from the repository root. Set the frontend URL to `ws://127.0.0.1:3000` in `frontend/.env.local` and restart Vite.

## Checks

Run from `frontend`.

```powershell
npm.cmd exec -- tsc --noEmit
npm.cmd test
npm.cmd run build
```

## Sources

- [Frontend source](https://github.com/Kandy3101c/pixel-perfect-pagecraft-881/tree/94df95aa3c4494862b3a07bfdfe266c9602d80ff)
- [PNC synthetic dataset](https://github.com/devfulcrum/pnc-utd-hackathon-2026/tree/55999aba3561270778f7830026bae666c5428740/Lab_Package/data)
