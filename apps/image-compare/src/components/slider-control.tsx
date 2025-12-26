import { Slider } from '@monorepo/components'
import { cn } from '@monorepo/utils'

type SliderControlProps = {
  onValueChange: (value: number[]) => void
  value: number[]
}

export function SliderControl({ onValueChange, value }: SliderControlProps) {
  return (
    <div className={cn('mb-8 px-2')} style={{ '--chart-2': 'var(--color-secondary)' } as React.CSSProperties}>
      <Slider className="w-full" max={100} onValueChange={onValueChange} step={1} value={value} />
    </div>
  )
}
