import type { CustomerProfile } from "@/data/types";

const healthCounts = [
  [2, 2, 0], [4, 0, 0], [2, 1, 1], [0, 2, 2], [1, 0, 3],
  [1, 0, 3], [2, 1, 1], [0, 2, 2], [3, 0, 1], [4, 0, 0],
  [2, 1, 1], [4, 0, 0], [2, 2, 0], [2, 1, 1], [2, 1, 1],
  [0, 3, 1], [2, 1, 1], [1, 1, 2], [2, 1, 1], [3, 1, 0],
  [2, 2, 0], [1, 0, 3], [2, 2, 0], [0, 2, 2], [2, 2, 0],
  [2, 2, 0], [1, 0, 3], [3, 1, 0], [1, 3, 0], [3, 0, 1],
] as const;

export const demoCustomers: CustomerProfile[] = healthCounts.map(([good, watch, risk], index) => {
  const number = String(index + 1).padStart(2, "0");
  const id = `C${String(index + 1).padStart(3, "0")}`;
  return { id, name: `Demo Customer ${number} (${id})`, health: { good, watch, risk } };
});
