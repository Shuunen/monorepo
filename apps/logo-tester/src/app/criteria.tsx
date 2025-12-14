import { Button, Paragraph, Tooltip, TooltipContent, TooltipTrigger } from '@monorepo/components'
import { cn, nbFourth, nbSecond, nbThird } from '@monorepo/utils'
// oxlint-disable-next-line no-restricted-imports
import { StarIcon } from 'lucide-react'
import { useState } from 'react'

type CriteriaProps = {
  name: string
  onSelection?: (pointValue: number) => void
}

const points = [
  {
    hint: 'no, not at all',
    value: nbSecond,
  },
  {
    hint: 'average, okay',
    value: nbThird,
  },
  {
    hint: 'yes, clearly',
    value: nbFourth,
  },
]

export function Criteria({ name, onSelection }: CriteriaProps) {
  const [value, setValue] = useState(0)
  function onClick(pointValue: number) {
    setValue(pointValue)
    if (onSelection) onSelection(pointValue)
  }
  return (
    <div className="flex justify-between items-center">
      <Paragraph>{name}</Paragraph>
      <div className="flex relative">
        {points.map(point => (
          <Tooltip key={point.value}>
            <TooltipTrigger asChild name={point.hint}>
              <Button className={cn('hover:text-yellow-300 h-5', { 'text-slate-500': value !== point.value, 'text-yellow-500': point.value <= value })} name={point.hint} onClick={() => onClick(point.value)} variant="link">
                <StarIcon className="size-5" fill={cn({ 'var(--color-yellow-800)': point.value <= value })} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white dark:bg-stone-900">
              <Paragraph>{point.hint}</Paragraph>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
