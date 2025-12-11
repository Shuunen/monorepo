import type { ComponentProps } from "react";
import { TooltipTrigger as ShadTooltipTrigger } from "../shadcn/tooltip";
import { type NameProp, testIdFromProps } from "./form.utils";

type TooltipTriggerProps = ComponentProps<typeof ShadTooltipTrigger> & NameProp;

export function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <ShadTooltipTrigger data-testid={testIdFromProps("tooltip-trigger", props)} {...props} />;
}

export { Tooltip, TooltipContent, TooltipProvider } from "../shadcn/tooltip";
