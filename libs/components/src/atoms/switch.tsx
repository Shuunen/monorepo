import { Switch as ShadSwitch } from '../shadcn/switch'

export function Switch(props: React.ComponentProps<typeof ShadSwitch>) {
  let classes = props.className ?? ''
  if (!props.disabled) classes = classes.concat(' cursor-pointer')
  return <ShadSwitch {...props} className={classes} />
}
