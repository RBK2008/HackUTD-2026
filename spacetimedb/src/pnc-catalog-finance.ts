type CatalogAccountBalance = {
  accountType: string;
  balanceCents: bigint;
  monthlyPaymentCents: bigint;
};

const assetTypes = new Set(['checking', 'savings', 'cd', 'ira']);

const liabilityTypes = new Set([
  'credit_card',
  'auto_loan',
  'personal_loan',
  'mortgage',
]);

export function calculateCatalogTotals(
  accounts: Iterable<CatalogAccountBalance>
) {
  let assetsCents = 0n;
  let liabilitiesCents = 0n;
  let monthlyDebtPaymentsCents = 0n;

  for (const account of accounts) {
    if (assetTypes.has(account.accountType)) {
      assetsCents += account.balanceCents;
    } else if (liabilityTypes.has(account.accountType)) {
      liabilitiesCents += account.balanceCents;
      monthlyDebtPaymentsCents += account.monthlyPaymentCents;
    } else {
      throw new Error(`Unknown PNC account type: ${account.accountType}`);
    }
  }

  return {
    assetsCents,
    liabilitiesCents,
    netWorthCents: assetsCents - liabilitiesCents,
    monthlyDebtPaymentsCents,
  };
}