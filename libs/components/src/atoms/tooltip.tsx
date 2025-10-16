import type { ComponentProps } from 'react'
import { TooltipTrigger as ShadTooltipTrigger } from '../shadcn/tooltip'

type TooltipTriggerProps = ComponentProps<typeof ShadTooltipTrigger> & {
  testId: string
}

export function TooltipTrigger({ testId, ...props }: TooltipTriggerProps) {
  return <ShadTooltipTrigger data-testid={testId} {...props} />
}

export { Tooltip, TooltipContent, TooltipProvider } from '../shadcn/tooltip'
