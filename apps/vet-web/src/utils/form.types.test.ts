import type { FieldBaseProps, Option } from "./form.types.ts";

describe("form.types", () => {
  it("should define Option type correctly", () => {
    expectTypeOf<Option>().toEqualTypeOf<{
      label: string;
      value: string;
    }>();
  });

  it("should allow creating valid Option objects", () => {
    const option: Option = {
      label: "Test Label",
      value: "test-value",
    };
    expectTypeOf(option).toMatchObjectType<Option>();
  });

  it("should define FieldBaseProps type correctly", () => {
    type TestFieldValues = { name: string };
    type TestFieldProps = Omit<FieldBaseProps<TestFieldValues>, "form">;

    expectTypeOf<TestFieldProps>().toMatchObjectType<{
      label?: string;
      name: keyof TestFieldValues;
      isRequired: boolean;
      placeholder?: string;
      disableNa?: boolean;
    }>();
  });
});
