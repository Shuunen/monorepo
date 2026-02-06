import {
  buildIsoFromLocal,
  dateIso10,
  dateIsoStripSecondsZone,
  dateIsoToReadableDatetime,
  dateToIsoString,
  isValidDate,
} from "./date-iso.js";

describe("date-iso", () => {
  // dateIso10
  it("dateIso10 A specific date", () => {
    expect(dateIso10(new Date("2018-11-30"))).toBe("2018-11-30");
  });
  it("dateIso10 B today", () => {
    expect(dateIso10(new Date())).toBe(new Date().toISOString().split("T")[0] ?? "");
  });

  // dateToIsoString
  it("dateToIsoString A has length", () => {
    expect(dateToIsoString(new Date()).length > 0).toBe(true);
  });
  it("dateToIsoString B contains timezone by default", () => {
    expect(dateToIsoString(new Date()).toLowerCase().includes("z")).toBe(true);
  });
  it("dateToIsoString C does not contains timezone if needed", () => {
    expect(dateToIsoString(new Date(), true).toLowerCase().includes("z")).toBe(false);
  });

  // dateIsoStripSecondsZone
  it("dateIsoStripSecondsZone A strips seconds and zone", () => {
    expect(dateIsoStripSecondsZone("2025-06-26T01:02:03.456Z")).toBe("2025-06-26T01:02");
  });
  it("dateIsoStripSecondsZone B handles ISO string without seconds", () => {
    expect(dateIsoStripSecondsZone("2025-06-26T01:02Z")).toBe("2025-06-26T01:02");
  });
  it("dateIsoStripSecondsZone C handles invalid input", () => {
    expect(dateIsoStripSecondsZone("")).toBe("");
    expect(dateIsoStripSecondsZone("invalid")).toBe("");
  });

  // dateIsoToReadableDatetime
  it("dateIsoToReadableDatetime A basic w/ time", () => {
    expect(dateIsoToReadableDatetime("2025-06-26T01:02:03.456Z")).toBe("26/06/2025 01:02");
  });
  it("dateIsoToReadableDatetime B basic w/o time", () => {
    expect(dateIsoToReadableDatetime("2025-06-26T01:02:03.456Z", false)).toBe("26/06/2025");
  });
  it("dateIsoToReadableDatetime C with null", () => {
    expect(dateIsoToReadableDatetime(null, false)).toBe("-");
  });
  it("dateIsoToReadableDatetime D with undefined", () => {
    expect(dateIsoToReadableDatetime(undefined, false)).toBe("-");
  });
  it("dateIsoToReadableDatetime E with Date object", () => {
    expect(dateIsoToReadableDatetime(new Date("2025-06-26T01:02:03.456Z"))).toBe("26/06/2025 01:02");
  });
  it("dateIsoToReadableDatetime F with invalid date string", () => {
    expect(dateIsoToReadableDatetime("invalid-date")).toBe("-");
  });
  it("dateIsoToReadableDatetime G with invalid Date object", () => {
    expect(dateIsoToReadableDatetime(new Date("invalid"))).toBe("-");
  });
  it("dateIsoToReadableDatetime H handles leap year date", () => {
    expect(dateIsoToReadableDatetime("2024-02-29T12:30:00Z")).toBe("29/02/2024 12:30");
    expect(dateIsoToReadableDatetime("2024-02-29T12:30:00Z", false)).toBe("29/02/2024");
  });

  // buildIsoFromLocal
  it("buildIsoFromLocal A returns empty if time is missing", () => {
    const datetime = buildIsoFromLocal("2025-06-26", "");
    expect(datetime).toBe("");
  });
  it("buildIsoFromLocal B returns empty if date is missing", () => {
    const datetime = buildIsoFromLocal("", "01:02");
    expect(datetime).toBe("");
  });
  it("buildIsoFromLocal C returns correct ISO string", () => {
    const datetime = buildIsoFromLocal("2025-06-26", "01:02");
    expect(datetime).toBe("2025-06-26T01:02:00Z");
  });
  it("buildIsoFromLocal D handles midnight correctly", () => {
    expect(buildIsoFromLocal("2023-01-01", "00:00")).toBe("2023-01-01T00:00:00Z");
  });
  it("buildIsoFromLocal E handles leap year", () => {
    expect(buildIsoFromLocal("2024-02-29", "14:15")).toBe("2024-02-29T14:15:00Z");
  });
  it("buildIsoFromLocal F handles invalid date and time", () => {
    expect(buildIsoFromLocal("invalid", "invalid")).toBe("");
  });

  // isValidDate
  it("isValidDate A with valid date", () => {
    expect(isValidDate(new Date("2025-06-26T01:02:03.456Z"))).toBe(true);
  });
  it("isValidDate B with undefined", () => {
    expect(isValidDate(undefined)).toBe(false);
  });
  it("isValidDate C with invalid date", () => {
    expect(isValidDate(new Date("invalid"))).toBe(false);
  });
  it("isValidDate D with epoch", () => {
    expect(isValidDate(new Date(0))).toBe(true);
  });
  it("isValidDate E with leap year", () => {
    expect(isValidDate(new Date("2024-02-29T00:00:00Z"))).toBe(true);
  });
});
