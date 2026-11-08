type CatalogStatement = {
  accountType: string;
  month: string;
  closingBalanceCents: bigint;
};

type CatalogTransaction = {
  accountType: string;
  postedDate: string;
  transactionType: string;
  flowClass: string;
  amountCents: bigint;
};

type MonthlySummary = {
  month: string;
  incomeCents: bigint;
  spendingCents: bigint;
  creditCardPaymentsCents: bigint;
  checkingBalanceCents: bigint;
  savingsBalanceCents: bigint;
  creditCardBalanceCents: bigint;
};

export function calculateCatalogMonthlySummary(
  statements: Iterable<CatalogStatement>,
  transactions: Iterable<CatalogTransaction>
): MonthlySummary[] {
  const months = new Map<string, MonthlySummary>();

  for (const statement of statements) {
    let summary = months.get(statement.month);

    if (!summary) {
      summary = {
        month: statement.month,
        incomeCents: 0n,
        spendingCents: 0n,
        creditCardPaymentsCents: 0n,
        checkingBalanceCents: 0n,
        savingsBalanceCents: 0n,
        creditCardBalanceCents: 0n,
      };
      months.set(statement.month, summary);
    }

    switch (statement.accountType) {
      case 'checking':
        summary.checkingBalanceCents += statement.closingBalanceCents;
        break;
      case 'savings':
        summary.savingsBalanceCents += statement.closingBalanceCents;
        break;
      case 'credit_card':
        summary.creditCardBalanceCents += statement.closingBalanceCents;
        break;
    }
  }

  for (const transaction of transactions) {
    const summary = months.get(transaction.postedDate.slice(0, 7));
    if (!summary) continue;

    if (transaction.flowClass === 'income') {
      summary.incomeCents += transaction.amountCents;
    } else if (transaction.flowClass === 'expense') {
      summary.spendingCents += transaction.amountCents;
    }

    if (
      transaction.accountType === 'credit_card' &&
      transaction.transactionType === 'payment'
    ) {
      summary.creditCardPaymentsCents += transaction.amountCents;
    }
  }

  return Array.from(months.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}
