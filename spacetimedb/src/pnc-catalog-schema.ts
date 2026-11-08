import { table, t } from 'spacetimedb/server';

export const pncCustomer = table(
  { name: 'pnc_customer', public: false },
  {
    customerId: t.string().primaryKey(),
    monthlyIncomeCents: t.i64(),
    monthlyNonDebtExpensesCents: t.i64(),
    creditLimitCents: t.i64(),
  }
);

export const pncAccount = table(
  { name: 'pnc_account', public: false },
  {
    accountId: t.string().primaryKey(),
    customerId: t.string().index('btree'),
    accountType: t.string(),
    balanceCents: t.i64(),
    monthlyPaymentCents: t.i64(),
    aprBasisPoints: t.i32(),
    openingBalanceCents: t.i64(),
    historyStart: t.string(),
    asOfDate: t.string(),
    annualYieldBasisPoints: t.i32(),
  }
);

export const pncTransaction = table(
  { name: 'pnc_transaction', public: false },
  {
    transactionId: t.string().primaryKey(),
    customerId: t.string().index('btree'),
    accountId: t.string().index('btree'),
    accountType: t.string(),
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

export const pncMonthlyStatement = table(
  { name: 'pnc_monthly_statement', public: false },
  {
    statementId: t.string().primaryKey(),
    customerId: t.string().index('btree'),
    accountId: t.string().index('btree'),
    accountType: t.string(),
    month: t.string(),
    openingBalanceCents: t.i64(),
    balanceIncreasesCents: t.u64(),
    balanceDecreasesCents: t.u64(),
    closingBalanceCents: t.i64(),
    transactionCount: t.u32(),
  }
);