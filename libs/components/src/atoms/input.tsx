import type { ComponentProps } from 'react'
import { Input as ShadInput } from '../shadcn/input'

type InputProps = ComponentProps<typeof ShadInput> & {
  testId: string
}

export function Input(props: InputProps) {
  return <ShadInput data-testid={props.testId} {...props} />
}
