import { expect, it } from "vitest";
import { mockData } from "./fixtures/mock";
it("receives chronological finished ratios and cash flow without calculating them", () => {
  expect(mockData.monthly[0]).toMatchObject({ month: "2025-11", debtToIncome: 0.33521093000958774, cashFlow: -654 });
  expect(mockData.monthly[11]).toMatchObject({ month: "2026-10", debtToIncome: 0.3240621713217249, cashFlow: 115 });
});
