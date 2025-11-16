import { camelToKebabCase, cn, slugify } from '@monorepo/utils'
import type { ComponentProps, ElementType } from 'react'
import { Input as ShadInput } from '../shadcn/input'

type InputProps = ComponentProps<typeof ShadInput> & {
  icon?: ElementType<{ className?: string }>
  testId?: string
}

export function Input({ icon: Icon, ...props }: InputProps) {
  const testId = props.testId || slugify(camelToKebabCase(props.name || 'input'))
  if (!Icon) return <ShadInput data-testid={testId} {...props} />
  return (
    <div className="relative">
      <div className="absolute bg-transparent top-[8px] left-[8px]">
        <Icon className={cn('w-[20px] h-[20px]', props.disabled && 'text-gray-400 stroke-current')} />
      </div>
      <ShadInput data-testid={testId} {...props} />
    </div>
  )
}
