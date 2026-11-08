import { describe, expect, it } from "vitest";
import { formatCurrency, formatCurrencyExact, formatSignedCurrency, formatPercent, formatRate, formatMonths, formatDate, formatMonthLabel, formatRelativeTime } from "@/lib/format";
describe("shared display formatting", () => {
  it("uses whole dollars at 100 and above", () => expect(formatCurrency(9971.34)).toBe("$9,971"));
  it("keeps cents below 100", () => expect(formatCurrency(42.5)).toBe("$42.50"));
  it("uses magnitude for negative currency precision", () => expect(formatCurrency(-311.78)).toBe("-$312"));
  it("keeps exact transaction cents", () => expect(formatCurrencyExact(1425.62)).toBe("$1,425.62"));
  it("shows positive transaction signs", () => expect(formatSignedCurrency(25.05)).toBe("+$25.05"));
  it("shows the real minus sign", () => expect(formatSignedCurrency(-311.78)).toBe("−$311.78"));
  it("formats decimal percent", () => expect(formatPercent(0.37)).toBe("37%"));
  it("formats over-limit percent", () => expect(formatPercent(1.87)).toBe("187%"));
  it("formats supplied rates without conversion", () => expect(formatRate(22.5)).toBe("22.5%"));
  it("formats supplied months", () => expect(formatMonths(2.2)).toBe("2.2 months"));
  it("formats dates", () => expect(formatDate("2026-10-31")).toBe("Oct 31, 2026"));
  it("formats month labels", () => expect(formatMonthLabel("2026-10")).toBe("Oct 2026"));
  it("formats fresh timestamps", () => expect(formatRelativeTime("2026-10-31T09:00:00Z", Date.parse("2026-10-31T09:00:00Z"))).toBe("just now"));
  it("formats relative minutes", () => expect(formatRelativeTime("2026-10-31T09:00:00Z", Date.parse("2026-10-31T09:02:00Z"))).toBe("2 min ago"));
});
