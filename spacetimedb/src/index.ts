import {
  schema,
  SenderError,
  table,
  t,
  type InferSchema,
  type ReducerCtx,
} from 'spacetimedb/server';
import { demoTransaction, demoMonthlyStatement } from './history-schema';
import { getPncHistory } from './pnc-history-data';
import { demoAlertSettings } from './settings-schema';
import {
  pncCustomer,
  pncAccount,
  pncTransaction,
  pncMonthlyStatement,
} from './pnc-catalog-schema';
import { importPncCatalogBatch } from './pnc-catalog-import';
import { calculateCatalogTotals } from './pnc-catalog-finance';
import { calculateCatalogMonthlySummary } from './pnc-catalog-history';

const demoProfile = table(
  { name: 'demo_profile', public: false },
  {
    owner: t.identity().primaryKey(),
    displayName: t.string(),
    asOfDate: t.string(),
  }
);

const demoAccount = table(
  { name: 'demo_account', public: false },
  {
    id: t.u64().primaryKey().autoInc(),
    owner: t.identity().index('btree'),
    label: t.string(),
    kind: t.string(),
    balanceCents: t.u64(),
    isLiability: t.bool(),
  }
);

const demoAlertState = table(
  { name: 'demo_alert_state', public: false },
  {
    key: t.string().primaryKey(),
    status: t.string(),
  }
);

const pncCustomerSelection = table(
  { name: 'pnc_customer_selection', public: false },
  {
    owner: t.identity().primaryKey(),
    customerId: t.string(),
  }
);

const spacetimedb = schema({
  person: table({ public: true }, { name: t.string() }),
  demoProfile,
  demoAccount,
  demoTransaction,
  demoMonthlyStatement,
  demoAlertState,
  demoAlertSettings,
  pncCustomer,
  pncAccount,
  pncTransaction,
  pncMonthlyStatement,
  pncCustomerSelection,
});

export default spacetimedb;

type SteadyReducerContext = ReducerCtx<InferSchema<typeof spacetimedb>>;

export const init = spacetimedb.init(_ctx => {});
export const onConnect = spacetimedb.clientConnected(_ctx => {});
export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {});

export const add = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    ctx.db.person.insert({ name });
  }
);

export const sayHello = spacetimedb.reducer(ctx => {
  for (const person of ctx.db.person.iter()) {
    console.info(`Hello, ${person.name}!`);
  }
  console.info('Hello, World!');
});

const demoAccounts = [
  { label: 'Checking', kind: 'checking', balanceCents: 160_400n, isLiability: false },
  { label: 'Savings', kind: 'savings', balanceCents: 1_741_660n, isLiability: false },
  { label: 'Credit card', kind: 'credit_card', balanceCents: 657_146n, isLiability: true },
];

export const seedDemo = spacetimedb.reducer(ctx => {
  const owner = ctx.sender;
  if (ctx.db.demoProfile.owner.find(owner)) return;

  ctx.db.demoProfile.insert({
    owner,
    displayName: 'Demo customer',
    asOfDate: '2026-10-31',
  });

  for (const account of demoAccounts) {
    ctx.db.demoAccount.insert({ id: 0n, owner, ...account });
  }
});

export const myDemoProfile = spacetimedb.view(
  { name: 'my_demo_profile', public: true },
  t.option(demoProfile.rowType),
  ctx => ctx.db.demoProfile.owner.find(ctx.sender) ?? undefined
);

export const myDemoAccounts = spacetimedb.view(
  { name: 'my_demo_accounts', public: true },
  t.array(demoAccount.rowType),
  ctx => Array.from(ctx.db.demoAccount.owner.filter(ctx.sender))
);

export const seedDemoHistory = spacetimedb.reducer(ctx => {
  const owner = ctx.sender;
  if (!ctx.db.demoMonthlyStatement.owner.filter(owner).next().done) return;

  const { transactions, statements } = getPncHistory();

  for (const transaction of transactions) {
    ctx.db.demoTransaction.insert({ id: 0n, owner, ...transaction });
  }

  for (const statement of statements) {
    ctx.db.demoMonthlyStatement.insert({ id: 0n, owner, ...statement });
  }
});

export const myDemoTransactions = spacetimedb.view(
  { name: 'my_demo_transactions', public: true },
  t.array(demoTransaction.rowType),
  ctx => Array.from(ctx.db.demoTransaction.owner.filter(ctx.sender))
);

export const myDemoMonthlyStatements = spacetimedb.view(
  { name: 'my_demo_monthly_statements', public: true },
  t.array(demoMonthlyStatement.rowType),
  ctx => Array.from(ctx.db.demoMonthlyStatement.owner.filter(ctx.sender))
);

const monthlySummaryFields = {
  month: t.string(),
  incomeCents: t.u64(),
  spendingCents: t.u64(),
  creditCardPaymentsCents: t.u64(),
  checkingBalanceCents: t.i64(),
  savingsBalanceCents: t.i64(),
  creditCardBalanceCents: t.i64(),
};

const monthlySummaryRow = t.object('DemoMonthlySummaryRow', monthlySummaryFields);

const legacyAccountTypes = new Map([
  ['A-C001-CHECKING', 'checking'],
  ['A-C001-SAVINGS', 'savings'],
  ['A-C001-CREDIT_CARD', 'credit_card'],
]);

export const myDemoMonthlySummary = spacetimedb.view(
  { name: 'my_demo_monthly_summary', public: true },
  t.array(monthlySummaryRow),
  ctx => {
    const statements = Array.from(
      ctx.db.demoMonthlyStatement.owner.filter(ctx.sender),
      row => ({ ...row, accountType: legacyAccountTypes.get(row.accountId) ?? '' })
    );

    const transactions = Array.from(
      ctx.db.demoTransaction.owner.filter(ctx.sender),
      row => ({ ...row, accountType: legacyAccountTypes.get(row.accountId) ?? '' })
    );

    return calculateCatalogMonthlySummary(statements, transactions);
  }
);

type BalanceStatement = {
  month: string;
  closingBalanceCents: bigint;
};

function getCreditCardAlert(
  statements: Iterable<BalanceStatement>,
  idPrefix: string
) {
  const [latest, previous] = Array.from(statements)
    .sort((a, b) => b.month.localeCompare(a.month));

  if (!latest || !previous) return undefined;

  const increaseCents = latest.closingBalanceCents - previous.closingBalanceCents;
  if (increaseCents <= 0n) return undefined;

  return {
    id: `${idPrefix}:${latest.month}`,
    title: 'Credit card balance increased',
    month: latest.month,
    increaseCents,
  };
}

function getLegacyCreditCardAlert(
  statements: Iterable<BalanceStatement & { accountId: string }>
) {
  return getCreditCardAlert(
    Array.from(statements).filter(row => row.accountId === 'A-C001-CREDIT_CARD'),
    'credit-card-balance-increase'
  );
}

function getCatalogCreditCardAlert(
  statements: Iterable<BalanceStatement & { accountType: string }>,
  customerId: string
) {
  return getCreditCardAlert(
    Array.from(statements).filter(row => row.accountType === 'credit_card'),
    `pnc:${customerId}:credit-card-balance-increase`
  );
}

function saveAlertState(
  ctx: SteadyReducerContext,
  alertId: string,
  status: string
) {
  if (status !== 'unread' && status !== 'read' && status !== 'dismissed') {
    throw new SenderError('Invalid alert status.');
  }

  const key = `${ctx.sender.toHexString()}:${alertId}`;
  const existing = ctx.db.demoAlertState.key.find(key);

  if (existing) {
    ctx.db.demoAlertState.key.update({ ...existing, status });
  } else {
    ctx.db.demoAlertState.insert({ key, status });
  }
}

const alertFields = {
  id: t.string(),
  title: t.string(),
  month: t.string(),
  increaseCents: t.i64(),
  read: t.bool(),
};

const demoAlertRow = t.object('DemoAlertRow', alertFields);

export const myDemoAlerts = spacetimedb.view(
  { name: 'my_demo_alerts', public: true },
  t.array(demoAlertRow),
  ctx => {
    const settings = ctx.db.demoAlertSettings.owner.find(ctx.sender);
    if (settings?.cardBalanceRising === false) return [];

    const alert = getLegacyCreditCardAlert(
      ctx.db.demoMonthlyStatement.owner.filter(ctx.sender)
    );
    if (!alert) return [];

    const key = `${ctx.sender.toHexString()}:${alert.id}`;
    const state = ctx.db.demoAlertState.key.find(key);
    if (state?.status === 'dismissed') return [];

    return [{ ...alert, read: state?.status === 'read' }];
  }
);

export const setDemoAlertState = spacetimedb.reducer(
  { alertId: t.string(), status: t.string() },
  (ctx, { alertId, status }) => {
    const alert = getLegacyCreditCardAlert(
      ctx.db.demoMonthlyStatement.owner.filter(ctx.sender)
    );

    if (alert?.id !== alertId) {
      throw new SenderError('Alert not found for this user.');
    }

    saveAlertState(ctx, alertId, status);
  }
);

const demoAlertSettingsRow = t.object('DemoAlertSettingsRow', {
  cardBalanceRising: t.bool(),
});

export const myDemoAlertSettings = spacetimedb.view(
  { name: 'my_demo_alert_settings', public: true },
  t.array(demoAlertSettingsRow),
  ctx => {
    const settings = ctx.db.demoAlertSettings.owner.find(ctx.sender);
    return [{ cardBalanceRising: settings?.cardBalanceRising ?? true }];
  }
);

export const saveDemoAlertSettings = spacetimedb.reducer(
  { cardBalanceRising: t.bool() },
  (ctx, { cardBalanceRising }) => {
    const owner = ctx.sender;
    const settings = { owner, cardBalanceRising };

    if (ctx.db.demoAlertSettings.owner.find(owner)) {
      ctx.db.demoAlertSettings.owner.update(settings);
    } else {
      ctx.db.demoAlertSettings.insert(settings);
    }
  }
);

export const importPncBatch = spacetimedb.reducer(
  {
    dataset: t.string(),
    columns: t.array(t.string()),
    rows: t.array(t.array(t.string())),
  },
  (ctx, { dataset, columns, rows }) => {
    importPncCatalogBatch(ctx, dataset, columns, rows);
  }
);

const pncCustomerOptionRow = t.object('PncCustomerOptionRow', {
  customerId: t.string(),
});

export const pncCustomerOptions = spacetimedb.view(
  { name: 'pnc_customer_options', public: true },
  t.array(pncCustomerOptionRow),
  ctx => Array.from(ctx.db.pncCustomer.iter(), customer => ({
    customerId: customer.customerId,
  }))
);

export const selectPncCustomer = spacetimedb.reducer(
  { customerId: t.string() },
  (ctx, { customerId }) => {
    if (!ctx.db.pncCustomer.customerId.find(customerId)) {
      throw new SenderError('Unknown PNC demo customer.');
    }

    const owner = ctx.sender;
    const selection = { owner, customerId };

    if (ctx.db.pncCustomerSelection.owner.find(owner)) {
      ctx.db.pncCustomerSelection.owner.update(selection);
    } else {
      ctx.db.pncCustomerSelection.insert(selection);
    }
  }
);

const selectedPncTotalsRow = t.object('SelectedPncTotalsRow', {
  customerId: t.string(),
  assetsCents: t.i64(),
  liabilitiesCents: t.i64(),
  netWorthCents: t.i64(),
  monthlyDebtPaymentsCents: t.i64(),
});

export const mySelectedPncTotals = spacetimedb.view(
  { name: 'my_selected_pnc_totals', public: true },
  t.option(selectedPncTotalsRow),
  ctx => {
    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    if (!ctx.db.pncCustomer.customerId.find(customerId)) return undefined;

    return {
      customerId,
      ...calculateCatalogTotals(ctx.db.pncAccount.customerId.filter(customerId)),
    };
  }
);

export const mySelectedPncProfile = spacetimedb.view(
  { name: 'my_selected_pnc_profile', public: true },
  t.option(pncCustomer.rowType),
  ctx => {
    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    return ctx.db.pncCustomer.customerId.find(customerId) ?? undefined;
  }
);

export const mySelectedPncAccounts = spacetimedb.view(
  { name: 'my_selected_pnc_accounts', public: true },
  t.array(pncAccount.rowType),
  ctx => {
    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    return Array.from(ctx.db.pncAccount.customerId.filter(customerId));
  }
);

export const mySelectedPncTransactions = spacetimedb.view(
  { name: 'my_selected_pnc_transactions', public: true },
  t.array(pncTransaction.rowType),
  ctx => {
    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    return Array.from(ctx.db.pncTransaction.customerId.filter(customerId));
  }
);

export const mySelectedPncMonthlyStatements = spacetimedb.view(
  { name: 'my_selected_pnc_monthly_statements', public: true },
  t.array(pncMonthlyStatement.rowType),
  ctx => {
    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    return Array.from(ctx.db.pncMonthlyStatement.customerId.filter(customerId));
  }
);

const selectedPncMonthlySummaryRow = t.object('SelectedPncMonthlySummaryRow', {
  customerId: t.string(),
  ...monthlySummaryFields,
});

export const mySelectedPncMonthlySummary = spacetimedb.view(
  { name: 'my_selected_pnc_monthly_summary', public: true },
  t.array(selectedPncMonthlySummaryRow),
  ctx => {
    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    const summary = calculateCatalogMonthlySummary(
      ctx.db.pncMonthlyStatement.customerId.filter(customerId),
      ctx.db.pncTransaction.customerId.filter(customerId)
    );

    return summary.map(month => ({ customerId, ...month }));
  }
);

const selectedPncAlertRow = t.object('SelectedPncAlertRow', {
  customerId: t.string(),
  ...alertFields,
});

export const mySelectedPncAlerts = spacetimedb.view(
  { name: 'my_selected_pnc_alerts', public: true },
  t.array(selectedPncAlertRow),
  ctx => {
    const settings = ctx.db.demoAlertSettings.owner.find(ctx.sender);
    if (settings?.cardBalanceRising === false) return [];

    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    const alert = getCatalogCreditCardAlert(
      ctx.db.pncMonthlyStatement.customerId.filter(customerId),
      customerId
    );
    if (!alert) return [];

    const key = `${ctx.sender.toHexString()}:${alert.id}`;
    const state = ctx.db.demoAlertState.key.find(key);
    if (state?.status === 'dismissed') return [];

    return [{ customerId, ...alert, read: state?.status === 'read' }];
  }
);

export const setSelectedPncAlertState = spacetimedb.reducer(
  { alertId: t.string(), status: t.string() },
  (ctx, { alertId, status }) => {
    const customerId =
      ctx.db.pncCustomerSelection.owner.find(ctx.sender)?.customerId ?? 'C001';

    const alert = getCatalogCreditCardAlert(
      ctx.db.pncMonthlyStatement.customerId.filter(customerId),
      customerId
    );

    if (alert?.id !== alertId) {
      throw new SenderError('Alert not found for the selected customer.');
    }

    saveAlertState(ctx, alertId, status);
  }
);