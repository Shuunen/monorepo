import { camelToKebabCase, slugify } from '@monorepo/utils'
import type { ComponentProps } from 'react'
import { Input as ShadInput } from '../shadcn/input'

type InputProps = ComponentProps<typeof ShadInput> & {
  testId?: string
}

export function Input(props: InputProps) {
  const testId = props.testId || slugify(camelToKebabCase(props.name || 'checkbox'))
  return <ShadInput data-testid={testId} {...props} />
}
