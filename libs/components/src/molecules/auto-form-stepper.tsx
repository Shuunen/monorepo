import { slugify } from '@monorepo/utils'
import { Button } from '../atoms/button'

type AutoFormStepperStep = {
  label: string
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
      {steps.map(({ label, icon, active, idx, state }) => (
        <Button data-state={state} disabled={disabled} key={label} onClick={() => onStepClick(idx)} testId={`step-${slugify(label)}`} variant={active ? 'default' : 'ghost'}>
          {icon}
          <span className="grow text-start">{label}</span>
        </Button>
      ))}
    </div>
  )
}
