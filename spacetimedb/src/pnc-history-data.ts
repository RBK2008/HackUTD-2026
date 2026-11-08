import history from './pnc-history.json';

function toCents(amount: string): bigint {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(amount);

  if (!match) {
    throw new Error(`Invalid PNC amount: ${amount}`);
  }

  const [, sign, dollars, fraction = ''] = match;
  const cents = BigInt(dollars) * 100n + BigInt(fraction.padEnd(2, '0'));
  return sign === '-' ? -cents : cents;
}

export function getPncHistory() {
  return {
    transactions: history.transactions.map(row => ({
      transactionId: row.transaction_id,
      accountId: row.account_id,
      postedDate: row.posted_date,
      transactionType: row.transaction_type,
      category: row.category,
      description: row.description,
      amountCents: toCents(row.amount),
      balanceChangeCents: toCents(row.balance_change),
      balanceAfterCents: toCents(row.balance_after),
      flowClass: row.flow_class,
      transferId: row.transfer_id || undefined,
    })),

    statements: history.statements.map(row => ({
      accountId: row.account_id,
      month: row.month,
      openingBalanceCents: toCents(row.opening_balance),
      balanceIncreasesCents: toCents(row.balance_increases),
      balanceDecreasesCents: toCents(row.balance_decreases),
      closingBalanceCents: toCents(row.closing_balance),
      transactionCount: Number(row.transaction_count),
    })),
  };
}