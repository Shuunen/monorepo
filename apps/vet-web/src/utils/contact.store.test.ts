import { beforeEach, describe, expect, it } from "vitest";
import { useFormStore } from "./contact.store";

describe(useFormStore, () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it("should initialize with empty fields", () => {
    const state = useFormStore.getState();
    expect(state.firstName).toBe("");
    expect(state.lastName).toBe("");
    expect(state.message).toBe("");
  });

  it("should set form data", () => {
    useFormStore.getState().setFormData({ firstName: "John", lastName: "Doe", message: "Hello" });
    const state = useFormStore.getState();
    expect(state.firstName).toBe("John");
    expect(state.lastName).toBe("Doe");
    expect(state.message).toBe("Hello");
  });

  it("should reset form data", () => {
    useFormStore.getState().setFormData({ firstName: "Jane", lastName: "Smith", message: "Test" });
    useFormStore.getState().resetForm();
    const state = useFormStore.getState();
    expect(state.firstName).toBe("");
    expect(state.lastName).toBe("");
    expect(state.message).toBe("");
  });
});
