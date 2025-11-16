import type { ComponentProps } from 'react'
import { FormDescription as ShadFormDescription, FormMessage as ShadFormMessage } from '../shadcn/form'

export { Form, FormControl, FormField, FormItem, FormLabel, useFormField } from '../shadcn/form'

type FormMessageProps = ComponentProps<typeof ShadFormMessage> & {
  testId: string
}

export function FormMessage({ ...props }: FormMessageProps) {
  return <ShadFormMessage data-testid={props.testId} {...props} role="alert" />
}

type FormDescriptionProps = ComponentProps<typeof ShadFormDescription> & {
  testId: string
}

export function FormDescription({ ...props }: FormDescriptionProps) {
  return <ShadFormDescription data-testid={props.testId} {...props} />
}
