import { alignForSnap } from "@monorepo/utils";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormSummary, type FormSummaryData } from "./form-summary";

describe("form-summary", () => {
  it("FormSummary A should render simple data", () => {
    const data = {
      age: {
        label: "Age",
        value: 30,
      },
      name: {
        label: "Name",
        value: "John Doe",
      },
    } satisfies FormSummaryData;
    const { container } = render(<FormSummary data={data} name="A" />);
    const cells = container.querySelectorAll("td");
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`"Age | 30 | Name | John Doe"`);
  });
  it("FormSummary B should handle empty object", () => {
    const data = {};
    const { container } = render(<FormSummary data={data} name="B" />);
    const cells = container.querySelectorAll("td");
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`""`);
  });
  it("FormSummary C should convert non-string values to strings", () => {
    const data = {
      age: {
        label: "Age",
        value: 30,
      },
      isActive: {
        label: "Is Active",
        value: true,
      },
      score: {
        label: "Score",
        value: 95.5,
      },
    };
    const { container } = render(<FormSummary data={data} name="C" />);
    const cells = container.querySelectorAll("td");
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`"Age | 30 | Is Active | true | Score | 95.5"`);
  });
});
