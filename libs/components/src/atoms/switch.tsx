import type { ComponentProps } from 'react'
import { Switch as ShadSwitch } from '../shadcn/switch'
import { type NameProp, testIdFromProps } from './form.utils'

type SwitchProps = ComponentProps<typeof ShadSwitch> & NameProp

export function Switch({ ...props }: SwitchProps) {
  let classes = props.className ?? ''
  if (!props.disabled) classes = classes.concat(' cursor-pointer')
  return <ShadSwitch data-testid={testIdFromProps('switch', props)} {...props} className={classes} />
}
