import { expect, it } from "vitest";
import { mockData } from "./fixtures/mock";
it("receives finished emergency goal fill and pie slices", () => {
  expect(mockData.metrics[0]).toMatchObject({ value: 2.2, goalProgress: 0.7333333333333333, ringOffset: 85.45132041764237 });
  expect(mockData.metricsAfterLinking[0]).toMatchObject({ value: 4.8, goalProgress: 1, ringOffset: 0 });
  expect(mockData.metrics[1]?.pieData).toEqual([{ name: "Debt payments", value: 37 }, { name: "Remaining income", value: 63 }]);
});
