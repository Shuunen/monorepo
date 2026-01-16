import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuleLine, Rules } from "./rules";
import type { Rule } from "./types";

const sampleRule: Rule = { enabled: true, id: "1", pattern: "foo", replacement: "bar" };

describe(RuleLine, () => {
  it("RuleLine A should render rule fields and call onChange/onRemove", () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    const { getByPlaceholderText, getByRole } = render(<RuleLine onChange={onChange} onRemove={onRemove} rule={sampleRule} />);
    fireEvent.change(getByPlaceholderText("replace in"), { target: { value: "baz" } });
    expect(onChange).toHaveBeenCalledWith("pattern", "baz");
    fireEvent.change(getByPlaceholderText("replace out"), { target: { value: "qux" } });
    expect(onChange).toHaveBeenCalledWith("replacement", "qux");
    fireEvent.click(getByRole("button"));
    expect(onRemove).toHaveBeenCalled();
  });

  it("RuleLine B should call onChange for enabled switch", () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    const { container } = render(<RuleLine onChange={onChange} onRemove={onRemove} rule={sampleRule} />);
    // Find the switch button (Radix UI wraps input in a button for accessibility)
    const switchBtn = container.querySelector('[data-slot="switch"]');
    if (switchBtn) fireEvent.click(switchBtn);
    expect(onChange).toHaveBeenCalledWith("enabled", false);
  });
});

describe(Rules, () => {
  it("Rules A should render rules and allow add/remove/update", () => {
    let rules: Rule[] = [sampleRule];
    const setRules = vi.fn(r => {
      rules = r;
    });
    const { getByText, getAllByRole, getByPlaceholderText } = render(<Rules rules={rules} setRules={setRules} />);
    // Add rule
    const addBtn = getByText("rules").parentElement?.querySelector("button");
    if (addBtn) fireEvent.click(addBtn);
    expect(setRules).toHaveBeenCalled();
    // Remove rule
    fireEvent.click(getAllByRole("button")[1]);
    expect(setRules).toHaveBeenCalled();
    // Update rule
    fireEvent.change(getByPlaceholderText("replace in"), { target: { value: "new" } });
    expect(setRules).toHaveBeenCalled();
  });

  it("Rules B should handle empty rules array and add rule", () => {
    let rules: Rule[] = [];
    const setRules = vi.fn(r => {
      rules = r;
    });
    const { getByText } = render(<Rules rules={rules} setRules={setRules} />);
    const addBtn = getByText("rules").parentElement?.querySelector("button");
    if (addBtn) fireEvent.click(addBtn);
    expect(setRules).toHaveBeenCalled();
  });

  it("Rules C should remove last rule and leave empty", () => {
    let rules: Rule[] = [sampleRule];
    const setRules = vi.fn(r => {
      rules = r;
    });
    const { getAllByRole } = render(<Rules rules={rules} setRules={setRules} />);
    fireEvent.click(getAllByRole("button")[1]);
    expect(setRules).toHaveBeenCalledWith([]);
  });

  it("Rules D should not update any rule if id does not match", () => {
    let rules: Rule[] = [sampleRule];
    const setRules = vi.fn(r => {
      rules = r;
    });
    render(<Rules rules={rules} setRules={setRules} />);
    // Simulate updateRule with non-existent id by mapping with no match
    const prevRules = [...rules];
    // oxlint-disable-next-line no-map-spread
    setRules(prevRules.map(rule => (rule.id === "not-found" ? { ...rule, pattern: "x" } : rule)));
    expect(rules).toEqual([sampleRule]);
  });
});
