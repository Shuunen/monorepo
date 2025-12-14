import { cn, slugify } from "@monorepo/utils";
import { Button } from "../atoms/button";
import { Title } from "../atoms/typography";

export type AutoFormStepperStep = {
  /** Optional section identifier for this step. */
  section?: string;
  /** The display title for this step, shown in the stepper and as the section heading. */
  title?: string;
  /** Optional subtitle text shown below the title. */
  subtitle?: string;
  /** Optional suffix text shown after the title (e.g., step number indicator). */
  suffix?: string;
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
  const btnClasses = cn("h-10 border border-transparent w-full", { "h-16 rounded-xl": subtitle }, { "ml-1": indent }, { "bg-white text-black border border-gray-500 hover:bg-gray-100": active });
  return (
    <div className="grid gap-2">
      {section && <Title level={4}>{section}</Title>}
      <div className={cn("flex items-center gap-0.5", { "opacity-60 pointer-events-none": state === "upcoming" })}>
        {indent && <div className={cn("h-10 w-1 bg-gray-200 shrink-0", { "h-16": subtitle })} />}
        <Button className={btnClasses} data-state={state} disabled={disabled} name={`step-${slugify(title ?? idx.toString())}`} onClick={() => onStepClick(idx)} variant="ghost">
          {icon}
          <div className="grow text-start flex flex-col ml-2">
            <div className="flex items-center gap-1">
              <span>{title}</span>
              {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
            </div>
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        </Button>
      </div>
    </div>
  );
}

export function AutoFormStepper({ steps, onStepClick, disabled = false, width }: AutoFormStepperProps) {
  return (
    <div className={cn("flex flex-col gap-4 mr-10", { [`w-[${width}px]`]: width })}>
      {steps.map(step => (
        <AutoFormStep disabled={disabled} key={step.title} onStepClick={onStepClick} step={step} />
      ))}
    </div>
  );
}
