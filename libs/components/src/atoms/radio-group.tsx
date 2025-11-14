import { camelToKebabCase, slugify } from '@monorepo/utils'
import { RadioGroup as ShadRadioGroup, RadioGroupItem as ShadRadioGroupItem } from '../shadcn/radio-group'

type RadioGroupProps = React.ComponentProps<typeof ShadRadioGroup> & {
  testId?: string
}

export function RadioGroup(props: RadioGroupProps) {
  const testId = props.testId || slugify(camelToKebabCase(`radio-group-${props.name}`))
  return <ShadRadioGroup data-testid={testId} {...props} />
}

type RadioGroupItemProps = React.ComponentProps<typeof ShadRadioGroupItem> & {
  name?: string
  testId?: string
}

export function RadioGroupItem(props: RadioGroupItemProps) {
  const testId = props.testId || slugify(camelToKebabCase(`radio-group-item-${props.name}-${props.value}`))
  return <ShadRadioGroupItem data-testid={testId} {...props} />
}
