import { afterEach, expect, it } from "vitest";
import { accountsStore } from "@/data/accountsStore";

afterEach(() => accountsStore.reset());

it("only offers PNC and all banks for the cloud demo", () => {
  expect(accountsStore.getSnapshot().institutions.map(({ id }) => id)).toEqual(["inst_pnc"]);
  accountsStore.selectInstitution("inst_platypus");
  expect(accountsStore.getSnapshot().selectedInstitutionId).toBe("all");
  accountsStore.selectInstitution("inst_pnc");
  expect(accountsStore.getSnapshot().selectedInstitutionId).toBe("inst_pnc");
});

it("clears the selected institution when PNC is disconnected", () => {
  accountsStore.selectInstitution("inst_pnc");
  accountsStore.disconnectBank("inst_pnc");
  expect(accountsStore.getSnapshot()).toMatchObject({ institutions: [], selectedInstitutionId: "all" });
});
