import { Slider } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import type { ContestState } from './comparison.utils'

type SliderControlProps = {
  contestState: ContestState | undefined
  onValueChange: (value: number[]) => void
  value: number[]
}

export function SliderControl({ contestState, onValueChange, value }: SliderControlProps) {
  const isContestComplete = contestState?.isComplete ?? false
  return (
    <div className={cn('mb-8 px-2', { hidden: isContestComplete })} style={{ '--chart-2': 'var(--color-secondary)' } as React.CSSProperties}>
      <Slider className="w-full" max={100} onValueChange={onValueChange} step={1} value={value} />
    </div>
  )
}
