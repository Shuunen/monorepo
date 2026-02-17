import type { ComponentProps } from "react";
import { InputGroup as ShadInputGroup, InputGroupButton as ShadInputGroupButton } from "../shadcn/input-group";
import { type NameProp, testIdFromProps } from "./form.utils";

type InputGroupProps = ComponentProps<typeof ShadInputGroup> & NameProp;

export function InputGroup({ ...props }: InputGroupProps) {
  return <ShadInputGroup data-testid={testIdFromProps("input-group", props)} {...props} />;
}

type InputGroupButtonProps = ComponentProps<typeof ShadInputGroupButton> & NameProp;

export function InputGroupButton({ ...props }: InputGroupButtonProps) {
  return <ShadInputGroupButton data-testid={testIdFromProps("input-group-button", props)} {...props} />;
}

export { InputGroupAddon } from "../shadcn/input-group";
