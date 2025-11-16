import { camelToKebabCase, slugify } from '@monorepo/utils'
import { Textarea as ShadTextarea } from '../shadcn/textarea'

type TextareaProps = React.ComponentProps<typeof ShadTextarea> & {
  /** the name of the form field, like firstName or email */
  name: string
  /** a specific test id to use, else will be generated based on the name */
  testId?: string
}

export function Textarea({ ...props }: TextareaProps) {
  const testId = props.testId || slugify(camelToKebabCase(`textarea-${props.name}`))
  return <ShadTextarea data-testid={testId} {...props} />
}
