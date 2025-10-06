import { camelToKebabCase, slugify } from '@monorepo/utils'
import type { ComponentProps } from 'react'
import { Checkbox as ShadCheckbox } from '../shadcn/checkbox'

type CheckboxProps = ComponentProps<typeof ShadCheckbox> & {
  testId?: string
}

export function Checkbox({ ...props }: CheckboxProps) {
  const testId = props.testId || slugify(camelToKebabCase(props.name || 'checkbox'))
  return <ShadCheckbox data-testid={testId} {...props} />
}
