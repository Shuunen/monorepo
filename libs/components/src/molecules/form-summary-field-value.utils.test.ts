import { getFormSummaryContent } from "./form-summary-field-value.utils";

describe("form-summary-field-value.utils", () => {
  it("getFormSummaryContent A should return notSpecified for undefined", () => {
    const content = getFormSummaryContent(undefined);
    expect(content).toMatchInlineSnapshot(`"Not specified"`);
  });

  it("getFormSummaryContent B should return notSpecified for null", () => {
    const content = getFormSummaryContent(null);
    expect(content).toMatchInlineSnapshot(`"Not specified"`);
  });

  it("getFormSummaryContent C should format Date values", () => {
    const content = getFormSummaryContent(new Date("2026-03-20"));
    expect(content).toMatchInlineSnapshot(`"20/03/2026"`);
  });

  it("getFormSummaryContent D should format date string values", () => {
    const content = getFormSummaryContent("2026-03-20");
    expect(content).toMatchInlineSnapshot(`"20/03/2026"`);
  });

  it("getFormSummaryContent E should format date-time strings", () => {
    const content = getFormSummaryContent("2026-03-20T08:30:00.000Z");
    expect(content).toMatchInlineSnapshot(`"20/03/2026 - 09:30"`);
  });

  it("getFormSummaryContent F should format booleans as title case", () => {
    const content = getFormSummaryContent(true);
    expect(content).toMatchInlineSnapshot(`"True"`);
  });

  it("getFormSummaryContent G should join arrays with commas", () => {
    const content = getFormSummaryContent(["Foo", "Bar", 2025]);
    expect(content).toMatchInlineSnapshot(`"Foo, Bar, 2025"`);
  });

  it("getFormSummaryContent H should fallback to stringify", () => {
    const content = getFormSummaryContent({ nested: { value: 1 } });
    expect(content).toMatchInlineSnapshot(`"{"nested":{"value":1}}"`);
  });
});
