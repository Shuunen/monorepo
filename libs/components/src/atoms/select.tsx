import type { ComponentProps } from "react";
import {
  Select as ShadcnSelect,
  SelectTrigger as ShadSelectTrigger,
  SelectItem as ShadSelectItem,
} from "../shadcn/select";
import { type NameProp, testIdFromProps } from "./form.utils";

type SelectProps = ComponentProps<typeof ShadcnSelect> & NameProp;

export function Select(props: SelectProps) {
  return <ShadcnSelect data-testid={testIdFromProps("select", props)} {...props} />;
}

type SelectTriggerProps = ComponentProps<typeof ShadSelectTrigger> & NameProp;

export function SelectTrigger(props: SelectTriggerProps) {
  return <ShadSelectTrigger data-testid={testIdFromProps("select-trigger", props)} {...props} />;
}

type SelectItemProps = ComponentProps<typeof ShadSelectItem> & NameProp;
export function SelectItem(props: SelectItemProps) {
  return <ShadSelectItem data-testid={testIdFromProps(props.name, { ...props, name: "option" }, true)} {...props} />;
}

export { SelectContent, SelectGroup, SelectLabel, SelectSeparator, SelectValue } from "../shadcn/select";
