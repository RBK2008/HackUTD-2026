import { table, t } from 'spacetimedb/server';

export const demoTransaction = table(
  { name: 'demo_transaction', public: false },
  {
    id: t.u64().primaryKey().autoInc(),
    owner: t.identity().index('btree'),
    transactionId: t.string(),
    accountId: t.string(),
    postedDate: t.string(),
    transactionType: t.string(),
    category: t.string(),
    description: t.string(),
    amountCents: t.u64(),
    balanceChangeCents: t.i64(),
    balanceAfterCents: t.i64(),
    flowClass: t.string(),
    transferId: t.option(t.string()),
  }
);

export const demoMonthlyStatement = table(
  { name: 'demo_monthly_statement', public: false },
  {
    id: t.u64().primaryKey().autoInc(),
    owner: t.identity().index('btree'),
    accountId: t.string(),
    month: t.string(),
    openingBalanceCents: t.i64(),
    balanceIncreasesCents: t.u64(),
    balanceDecreasesCents: t.u64(),
    closingBalanceCents: t.i64(),
    transactionCount: t.u32(),
  }
);