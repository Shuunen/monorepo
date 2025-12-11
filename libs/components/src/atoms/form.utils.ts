import { camelToKebabCase, slugify } from "@monorepo/utils";

export type NameProp = {
  /** a name of the form field or component, like firstName or email */
  name: string;
};

export function testIdFromProps(prefix: string, props: NameProp, addValue?: boolean): string {
  if (prefix === "") {
    throw new Error("prefix cannot be empty string when deriving testId from name");
  }
  if (props.name === "") {
    throw new Error("name cannot be empty string when deriving testId from name");
  }
  const value = addValue && "value" in props ? `-${props.value}` : "";
  return slugify(camelToKebabCase(`${prefix}-${props.name}${value}`));
}
