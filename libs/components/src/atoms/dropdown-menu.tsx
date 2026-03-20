import type { ComponentProps } from "react";
import {
  DropdownMenu,
  DropdownMenuContent as ShadDropdownMenuContent,
  DropdownMenuItem as ShadDropdownMenuItem,
  DropdownMenuTrigger as ShadDropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { type NameProp, testIdFromProps } from "./form.utils";

type DropdownMenuTriggerProps = ComponentProps<typeof ShadDropdownMenuTrigger> & NameProp;
type DropdownMenuContentProps = ComponentProps<typeof ShadDropdownMenuContent> & NameProp;
type DropdownMenuItemProps = ComponentProps<typeof ShadDropdownMenuItem> & NameProp;

export function DropdownMenuTrigger({ ...props }: DropdownMenuTriggerProps) {
  return <ShadDropdownMenuTrigger data-testid={testIdFromProps("dropdown-menu-trigger", props)} {...props} />;
}

export function DropdownMenuContent({ ...props }: DropdownMenuContentProps) {
  return <ShadDropdownMenuContent data-testid={testIdFromProps("dropdown-menu-content", props)} {...props} />;
}

export function DropdownMenuItem({ ...props }: DropdownMenuItemProps) {
  return <ShadDropdownMenuItem data-testid={testIdFromProps("dropdown-menu-item", props)} {...props} />;
}

export { DropdownMenu };
