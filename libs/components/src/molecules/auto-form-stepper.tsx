import { CircleDotIcon, CircleIcon } from 'lucide-react'
import { Button } from '../atoms/button'

export function Stepper({ steps, currentStep, onStepClick }: { steps: string[]; currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex flex-col gap-4 pr-8 border-r border-gray-200 mr-8">
      {steps.map((label, idx) => (
        <Button key={label} onClick={() => onStepClick(idx)} variant={idx === currentStep ? 'default' : 'ghost'}>
          {idx === currentStep ? <CircleDotIcon /> : <CircleIcon />}
          <span className="grow text-start">{label}</span>
        </Button>
      ))}
    </div>
  )
}
