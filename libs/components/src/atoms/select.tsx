import type { ComponentProps } from 'react'
import { Select as ShadcnSelect, SelectTrigger as ShadSelectTrigger } from '../shadcn/select'
import { type NameProp, testIdFromProps } from './form.utils'

type SelectProps = ComponentProps<typeof ShadcnSelect> & NameProp

export function Select(props: SelectProps) {
  return <ShadcnSelect data-testid={testIdFromProps('select', props)} {...props} />
}

type SelectTriggerProps = ComponentProps<typeof ShadSelectTrigger> & NameProp

export function SelectTrigger(props: SelectTriggerProps) {
  return <ShadSelectTrigger data-testid={testIdFromProps('select-trigger', props)} {...props} />
}

export { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectValue } from '../shadcn/select'
