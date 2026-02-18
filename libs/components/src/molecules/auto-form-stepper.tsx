import { cn, slugify } from "@monorepo/utils";
import { Button } from "../atoms/button";
import { Title } from "../atoms/typography";
import type { StringLike } from "./auto-form.types";
import { typeLikeResolver } from "./auto-form.utils";
import { useFormContext } from "react-hook-form";

export type AutoFormStepperStep = {
  /** Optional section identifier for this step. */
  section?: StringLike;
  /** The display title for this step, shown in the stepper and as the section heading. */
  title?: StringLike;
  /** Optional subtitle text shown below the title. */
  subtitle?: StringLike;
  /** Optional suffix text shown after the title (e.g., step number indicator). */
  suffix?: StringLike;
  /** Optional indentation/marker for the step. */
  indent?: boolean;
  /** The icon to display for this step. */
  icon: React.ReactNode;
  /** Whether this step is currently active. */
  active: boolean;
  /** The index of this step in the stepper. */
  idx: number;
  /** The interaction state of the step. */
  state: "readonly" | "success" | "editable" | "upcoming";
};

type AutoFormStepperProps = {
  disabled?: boolean;
  onStepClick: (step: number) => void;
  steps: AutoFormStepperStep[];
  /** A fixed width if needed */
  width?: number;
};

type AutoFormStepProps = {
  step: AutoFormStepperStep;
  disabled?: boolean;
  onStepClick: (idx: number) => void;
};

function AutoFormStep({ step, disabled = false, onStepClick }: AutoFormStepProps) {
  const { title, subtitle, suffix, icon, active, idx, state, indent, section } = step;
  const context = useFormContext();
  const values = context?.getValues();
  const btnClasses = cn(
    "h-10 w-full border border-transparent",
    { "h-16 rounded-xl": subtitle },
    { "ml-1": indent },
    { "border border-gray-500 bg-white text-black hover:bg-gray-100": active },
  );
  return (
    <div className="grid gap-2">
      {section && <Title level={4}>{typeLikeResolver(section, values)}</Title>}
      <div className={cn("flex items-center gap-0.5", { "pointer-events-none opacity-60": state === "upcoming" })}>
        {indent && <div className={cn("h-10 w-1 shrink-0 bg-gray-200", { "h-16": subtitle })} />}
        <Button
          className={btnClasses}
          data-active={active}
          data-state={state}
          disabled={disabled}
          name={`step-${slugify(typeLikeResolver(title ?? idx.toString(), values))}`}
          onClick={() => onStepClick(idx)}
          variant="ghost"
        >
          {icon}
          <div className="ml-2 flex grow flex-col text-start">
            <div className="flex items-center gap-1">
              <span>{typeLikeResolver(title, values)}</span>
              {suffix && <span className="text-xs text-muted-foreground">{typeLikeResolver(suffix, values)}</span>}
            </div>
            {subtitle && <span className="text-xs text-muted-foreground">{typeLikeResolver(subtitle, values)}</span>}
          </div>
        </Button>
      </div>
    </div>
  );
}

export function AutoFormStepper({ steps, onStepClick, disabled = false, width }: AutoFormStepperProps) {
  const context = useFormContext();
  const values = context?.getValues();
  return (
    <div className={cn("mr-10 flex flex-col gap-4", { [`w-[${width}px]`]: width })}>
      {steps.map(step => (
        <AutoFormStep
          disabled={disabled}
          key={typeLikeResolver(step.title, values)}
          onStepClick={onStepClick}
          step={step}
        />
      ))}
    </div>
  );
}
