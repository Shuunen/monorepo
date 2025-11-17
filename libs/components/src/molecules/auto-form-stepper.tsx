import { cn, slugify } from '@monorepo/utils'
import { Button } from '../atoms/button'

export type AutoFormStepperStep = {
  /** The display title for this step, shown in the stepper and as the section heading. */
  title: string
  /** Optional subtitle text shown below the title. */
  subtitle?: string
  /** Optional suffix text shown after the title (e.g., step number indicator). */
  suffix?: string
  /** Optional indentation/marker for the step. */
  indent?: boolean
  /** The icon to display for this step. */
  icon: React.ReactNode
  /** Whether this step is currently active. */
  active: boolean
  /** The index of this step in the stepper. */
  idx: number
  /** The interaction state of the step. */
  state: 'readonly' | 'success' | 'editable' | 'upcoming'
}

type AutoFormStepperProps = {
  disabled?: boolean
  onStepClick: (step: number) => void
  steps: AutoFormStepperStep[]
}

export function AutoFormStepper({ steps, onStepClick, disabled = false }: AutoFormStepperProps) {
  return (
    <div className="flex flex-col gap-4 pr-8 border-r border-gray-200 mr-8">
      {steps.map(({ title, subtitle, suffix, icon, active, idx, state, indent }) => (
        <div className={cn('flex items-center gap-0.5', { 'opacity-60 pointer-events-none': state === 'upcoming' })} key={title}>
          {indent && <div className={cn('h-10 w-1 bg-gray-200', { 'h-16': subtitle })} />}
          <Button
            className={cn('h-10 border border-transparent', { 'h-16 rounded-xl': subtitle }, { 'ml-1': indent }, { 'bg-white text-black border border-gray-500 hover:bg-gray-100': active })}
            data-state={state}
            disabled={disabled}
            onClick={() => onStepClick(idx)}
            testId={`step-${slugify(title)}`}
            variant={active ? 'default' : 'ghost'}
          >
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
      ))}
    </div>
  )
}
