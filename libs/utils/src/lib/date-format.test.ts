import { formatDate } from "./date-format.js";

describe("date-format", () => {
  const date = new Date("2021-09-02T07:08:28");
  it("formatDate A (space) HH:mm:ss", () => {
    expect(formatDate(date, " HH:mm:ss")).toBe(" 07:08:28");
  });
  it("formatDate B d", () => {
    expect(formatDate(date, "d")).toBe("2");
  });
  it("formatDate C dd", () => {
    expect(formatDate(date, "dd")).toBe("02");
  });
  it("formatDate D dd/MM/yyyy HH:mm:ss", () => {
    expect(formatDate(date, "dd/MM/yyyy HH:mm:ss")).toBe("02/09/2021 07:08:28");
  });
  it("formatDate E dd/MM/yyyy", () => {
    expect(formatDate(date, "dd/MM/yyyy")).toBe("02/09/2021");
  });
  it("formatDate F eee d", () => {
    expect(formatDate(date, "eee d")).toBe("Thu 2");
  });
  it("formatDate G eee", () => {
    expect(formatDate(date, "eee")).toBe("Thu");
  });
  it("formatDate H eeee", () => {
    expect(formatDate(date, "eeee")).toBe("Thursday");
  });
  it("formatDate I HH", () => {
    expect(formatDate(date, "HH")).toBe("07");
  });
  it("formatDate J mm", () => {
    expect(formatDate(date, "mm")).toBe("08");
  });
  it("formatDate K MM", () => {
    expect(formatDate(date, "MM")).toBe("09");
  });
  it("formatDate L MMMM", () => {
    expect(formatDate(date, "MMMM")).toBe("September");
  });
  it("formatDate M ss", () => {
    expect(formatDate(date, "ss")).toBe("28");
  });
  it("formatDate N yy-MM-dd", () => {
    expect(formatDate(date, "yy-MM-dd")).toBe("21-09-02");
  });
  it("formatDate O yy", () => {
    expect(formatDate(date, "yy")).toBe("21");
  });
  it("formatDate P yyyy (space)", () => {
    expect(formatDate(date, "yyyy ")).toBe("2021 ");
  });
  it("formatDate Q yyyy", () => {
    expect(formatDate(date, "yyyy")).toBe("2021");
  });
});
