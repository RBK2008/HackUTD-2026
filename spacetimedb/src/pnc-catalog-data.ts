type CsvRow = Record<string, string>;

function toHundredths(value: string): bigint {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(value);

  if (!match) {
    throw new Error(`Expected a number with at most two decimals: ${value}`);
  }

  const [, sign, whole, fraction = ''] = match;
  const amount = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return sign === '-' ? -amount : amount;
}

export function toPncCustomer(row: CsvRow) {
  return {
    customerId: row.customer_id,
    monthlyIncomeCents: toHundredths(row.monthly_income),
    monthlyNonDebtExpensesCents: toHundredths(row.monthly_non_debt_expenses),
    creditLimitCents: toHundredths(row.credit_limit),
  };
}

export function toPncAccount(row: CsvRow) {
  return {
    accountId: row.account_id,
    customerId: row.customer_id,
    accountType: row.account_type,
    balanceCents: toHundredths(row.balance),
    monthlyPaymentCents: toHundredths(row.monthly_payment),
    aprBasisPoints: Number(toHundredths(row.apr_pct)),
    openingBalanceCents: toHundredths(row.opening_balance),
    historyStart: row.history_start,
    asOfDate: row.as_of_date,
    annualYieldBasisPoints: Number(toHundredths(row.annual_yield_pct)),
  };
}

export function toPncTransaction(row: CsvRow) {
  return {
    transactionId: row.transaction_id,
    customerId: row.customer_id,
    accountId: row.account_id,
    accountType: row.account_type,
    postedDate: row.posted_date,
    transactionType: row.transaction_type,
    category: row.category,
    description: row.description,
    amountCents: toHundredths(row.amount),
    balanceChangeCents: toHundredths(row.balance_change),
    balanceAfterCents: toHundredths(row.balance_after),
    flowClass: row.flow_class,
    transferId: row.transfer_id || undefined,
  };
}

export function toPncMonthlyStatement(row: CsvRow) {
  return {
    statementId: `${row.account_id}:${row.month}`,
    customerId: row.customer_id,
    accountId: row.account_id,
    accountType: row.account_type,
    month: row.month,
    openingBalanceCents: toHundredths(row.opening_balance),
    balanceIncreasesCents: toHundredths(row.balance_increases),
    balanceDecreasesCents: toHundredths(row.balance_decreases),
    closingBalanceCents: toHundredths(row.closing_balance),
    transactionCount: Number(row.transaction_count),
  };
}
