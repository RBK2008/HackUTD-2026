import { DbConnection } from "@/module_bindings";

const uri =
  import.meta.env["VITE_SPACETIMEDB_URI"] || "wss://maincloud.spacetimedb.com";
const database =
  import.meta.env["VITE_SPACETIMEDB_DATABASE"] || "steady-ylqvp";

const tokenKey = `steady:${uri}:${database}:auth`;

let pendingConnection: Promise<DbConnection> | undefined;

export function getSteadyConnection(): Promise<DbConnection> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Steady connects to SpacetimeDB in the browser."));
  }

  if (pendingConnection) return pendingConnection;

  const connection = new Promise<DbConnection>((resolve, reject) => {
    DbConnection.builder()
      .withUri(uri)
      .withDatabaseName(database)
      .withToken(window.localStorage.getItem(tokenKey) ?? undefined)
      .onConnect((client, _identity, token) => {
        window.localStorage.setItem(tokenKey, token);
        resolve(client);
      })
      .onConnectError((_ctx, error) => {
        reject(error);
      })
      .onDisconnect(() => {
        if (pendingConnection === connection) pendingConnection = undefined;
        reject(new Error("The SpacetimeDB connection closed."));
      })
      .build();
  });

  pendingConnection = connection;

  void connection.catch(() => {
    if (pendingConnection === connection) pendingConnection = undefined;
  });

  return connection;
}

export async function selectSteadyCustomer(customerId: string): Promise<void> {
  const connection = await getSteadyConnection();
  await connection.reducers.selectPncCustomer({ customerId });
}