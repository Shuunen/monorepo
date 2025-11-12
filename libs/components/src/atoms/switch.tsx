import { camelToKebabCase, slugify } from '@monorepo/utils'
import type { ComponentProps } from 'react'
import { Switch as ShadSwitch } from '../shadcn/switch'

type SwitchProps = ComponentProps<typeof ShadSwitch> & {
  testId?: string
}

export function Switch({ ...props }: SwitchProps) {
  const testId = props.testId || slugify(camelToKebabCase(props.name || 'switch'))
  let classes = props.className ?? ''
  if (!props.disabled) classes = classes.concat(' cursor-pointer')
  return <ShadSwitch data-testid={testId} {...props} className={classes} />
}
