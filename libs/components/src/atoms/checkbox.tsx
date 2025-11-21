import type { ComponentProps } from 'react'
import { Checkbox as ShadCheckbox } from '../shadcn/checkbox'
import { type NameProp, testIdFromProps } from './form.utils'

type CheckboxProps = ComponentProps<typeof ShadCheckbox> & NameProp

export function Checkbox({ ...props }: CheckboxProps) {
  return <ShadCheckbox data-testid={testIdFromProps('checkbox', props)} {...props} />
}
