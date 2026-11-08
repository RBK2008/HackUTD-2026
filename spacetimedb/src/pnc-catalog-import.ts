import { SenderError, type InferSchema, type ReducerCtx } from 'spacetimedb/server';
import type spacetimedb from './index';
import {
  toPncCustomer,
  toPncAccount,
  toPncTransaction,
  toPncMonthlyStatement,
} from './pnc-catalog-data';

type CatalogContext = ReducerCtx<InferSchema<typeof spacetimedb>>;

const importerIdentity =
  'c2008805897e60db359ed574dc49abaef1d7015a59757833ad577470de83b6f3';

function verifyCatalogCounts(ctx: CatalogContext) {
  const counts = [
    ['customers', Number(ctx.db.pncCustomer.count()), 30],
    ['accounts', Number(ctx.db.pncAccount.count()), 196],
    ['transactions', Number(ctx.db.pncTransaction.count()), 21_225],
    ['monthly statements', Number(ctx.db.pncMonthlyStatement.count()), 4_704],
  ] as const;

  const mismatches = counts
    .filter(([, actual, expected]) => actual !== expected)
    .map(([dataset, actual, expected]) => `${dataset}: expected ${expected}, found ${actual}`);

  if (mismatches.length > 0) {
    throw new SenderError(`Catalog count mismatch. ${mismatches.join('. ')}`);
  }
}

export function importPncCatalogBatch(
  ctx: CatalogContext,
  dataset: string,
  columns: string[],
  rows: string[][]
) {
  if (ctx.sender.toHexString() !== importerIdentity) {
    throw new SenderError('Only the catalog importer may load or verify PNC data.');
  }

  if (dataset === 'verify') {
    if (columns.length !== 0 || rows.length !== 0) {
      throw new SenderError('Verification requires empty columns and rows.');
    }
    verifyCatalogCounts(ctx);
    return;
  }

  if (
    dataset !== 'profiles' &&
    dataset !== 'accounts' &&
    dataset !== 'transactions' &&
    dataset !== 'monthly_statements'
  ) {
    throw new SenderError('Unknown PNC dataset.');
  }

  if (rows.length === 0 || rows.length > 200) {
    throw new SenderError('A batch must contain 1 to 200 rows.');
  }

  if (columns.length === 0 || new Set(columns).size !== columns.length) {
    throw new SenderError('A batch must have unique column names.');
  }

  for (const values of rows) {
    if (values.length !== columns.length) {
      throw new SenderError('A row does not match the batch columns.');
    }

    const row = Object.fromEntries(
      columns.map((column, index) => [column, values[index]])
    );

    switch (dataset) {
      case 'profiles': {
        const customer = toPncCustomer(row);
        if (!ctx.db.pncCustomer.customerId.find(customer.customerId)) {
          ctx.db.pncCustomer.insert(customer);
        }
        break;
      }

      case 'accounts': {
        const account = toPncAccount(row);
        if (!ctx.db.pncAccount.accountId.find(account.accountId)) {
          ctx.db.pncAccount.insert(account);
        }
        break;
      }

      case 'transactions': {
        const transaction = toPncTransaction(row);
        if (!ctx.db.pncTransaction.transactionId.find(transaction.transactionId)) {
          ctx.db.pncTransaction.insert(transaction);
        }
        break;
      }

      case 'monthly_statements': {
        const statement = toPncMonthlyStatement(row);
        if (!ctx.db.pncMonthlyStatement.statementId.find(statement.statementId)) {
          ctx.db.pncMonthlyStatement.insert(statement);
        }
        break;
      }
    }
  }
}