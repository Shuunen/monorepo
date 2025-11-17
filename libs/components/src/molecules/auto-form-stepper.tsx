import { cn, slugify } from '@monorepo/utils'
import { Button } from '../atoms/button'

type AutoFormStepperStep = {
  title: string
  subtitle?: string
  suffix?: string
  indent?: boolean
  icon: React.ReactNode
  active: boolean
  idx: number
  state: 'readonly' | 'success' | 'editable'
}

type AutoFormStepperProps = {
  disabled?: boolean
  onStepClick: (step: number) => void
  steps: AutoFormStepperStep[]
}

export function AutoFormStepper({ steps, onStepClick, disabled = false }: AutoFormStepperProps) {
  return (
    <div className="flex flex-col gap-4 pr-8 border-r border-gray-200 mr-8">
      {steps.map(({ title, subtitle, suffix, icon, active, idx, state }) => (
        <Button
          className={cn('h-10', { 'h-16 rounded-xl': subtitle }, { 'bg-transparent text-black border border-gray-500 hover:bg-gray-100': active })}
          data-state={state}
          disabled={disabled}
          key={title}
          onClick={() => onStepClick(idx)}
          testId={`step-${slugify(title)}`}
          variant={active ? 'default' : 'ghost'}
        >
          {icon}
          <div className="grow text-start flex flex-col ml-2">
            <div className="flex items-center gap-2">
              <span>{title}</span>
              {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
            </div>
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        </Button>
      ))}
    </div>
  )
}
