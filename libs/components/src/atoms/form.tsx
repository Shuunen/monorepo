import { camelToKebabCase, slugify } from '@monorepo/utils'
import type { ComponentProps } from 'react'
import { FormDescription as ShadFormDescription, FormMessage as ShadFormMessage } from '../shadcn/form'

type FormMessageProps = ComponentProps<typeof ShadFormMessage> & {
  /** the name of the form field, like firstName or email */
  name: string
  /** a specific test id to use, else will be generated based on the name */
  testId?: string
}

export function FormMessage({ ...props }: FormMessageProps) {
  const testId = props.testId || slugify(camelToKebabCase(`form-message-${props.name}`))
  return <ShadFormMessage data-testid={testId} {...props} role="alert" />
}

type FormDescriptionProps = ComponentProps<typeof ShadFormDescription> & {
  /** the name of the form field, like firstName or email */
  name: string
  /** a specific test id to use, else will be generated based on the name */
  testId?: string
}

export function FormDescription({ ...props }: FormDescriptionProps) {
  const testId = props.testId || slugify(camelToKebabCase(`form-description-${props.name}`))
  return <ShadFormDescription data-testid={testId} {...props} />
}

export { Form, FormControl, FormField, FormItem, FormLabel, useFormField } from '../shadcn/form'
