import type { ComponentProps } from 'react'
import { FormMessage as ShadFormMessage } from '../shadcn/form'

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '../shadcn/form'

type FormMessageProps = ComponentProps<typeof ShadFormMessage> & {
  testId: string
}

export function FormMessage({ ...props }: FormMessageProps) {
  return <ShadFormMessage data-testid={props.testId} {...props} role="alert" />
}
