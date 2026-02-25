import type { JSX } from "react";
import { RadioGroup as ShadRadioGroup, RadioGroupItem as ShadRadioGroupItem } from "../shadcn/radio-group";
import { cn } from "../shadcn/utils";
import { type NameProp, testIdFromProps } from "./form.utils";
import { Label } from "./label";

type RadioGroupProps = React.ComponentProps<typeof ShadRadioGroup> & NameProp;

export function RadioGroup(props: RadioGroupProps) {
  return <ShadRadioGroup data-testid={testIdFromProps("radio", props)} {...props} />;
}

type RadioGroupItemProps = React.ComponentProps<typeof ShadRadioGroupItem> & NameProp;

export function RadioGroupItem(props: RadioGroupItemProps) {
  return <ShadRadioGroupItem data-testid={testIdFromProps("radio-item", props, true)} {...props} />;
}

export type RadioOption = {
  /** The display label, like "United States" */
  label: string;
  /** The actual value, like "US" */
  value: string;
  /** Optional description, like "Population: 331 million" */
  description?: string;
  /** Optional icon, can be a JSX element or a function that returns a JSX element based on the option data */
  icon?: JSX.Element | ((params: Record<string, unknown>) => JSX.Element);
  /** Optional color for the icon */
  iconColor?:
    | "text-black"
    | "text-primary"
    | "text-secondary"
    | "text-success"
    | "text-destructive"
    | "text-warning"
    | "text-info";
};

type RadioGroupChoiceCardProps = RadioGroupItemProps & NameProp & RadioOption;

export function RadioGroupChoiceCard(props: RadioGroupChoiceCardProps) {
  const { className, description, icon, iconColor, label, ...radioItemProps } = props;
  const labelClasses = cn(className, "flex items-center gap-4 rounded-md border p-4", {
    "cursor-not-allowed": props.disabled,
    "cursor-pointer hover:bg-gray-50": !props.disabled,
  });
  const iconClasses = cn(iconColor, "table rounded bg-current/10 p-2", { "bg-current/0": props.disabled });
  return (
    <Label className={labelClasses}>
      <RadioGroupItem {...radioItemProps} />
      {icon && <div className={iconClasses}>{typeof icon === "function" ? icon({}) : icon}</div>}
      <div>
        {label}
        {description && <div className="mt-1 text-xs font-normal">{description}</div>}
      </div>
    </Label>
  );
}
