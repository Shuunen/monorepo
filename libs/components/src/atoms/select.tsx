import { camelToKebabCase, slugify } from '@monorepo/utils'
import type { ComponentProps } from 'react'
import { Select as ShadcnSelect, SelectTrigger as ShadSelectTrigger } from '../shadcn/select'

type SelectProps = ComponentProps<typeof ShadcnSelect> & {
  testId?: string
}

export function Select(props: SelectProps) {
  const testId = props.testId || slugify(camelToKebabCase(props.name || 'select'))
  return <ShadcnSelect data-testid={testId} {...props} />
}

type SelectTriggerProps = ComponentProps<typeof ShadSelectTrigger> & {
  testId?: string
}

export function SelectTrigger(props: SelectTriggerProps) {
  const testId = props.testId || slugify(camelToKebabCase(props.name || 'select-trigger'))
  return <ShadSelectTrigger data-testid={testId} {...props} />
}

export { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectValue } from '../shadcn/select'
