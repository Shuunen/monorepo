import type { ComponentProps } from 'react'
import { Toaster as ShadToaster } from '../shadcn/sonner'
import { type NameProp, testIdFromProps } from './form.utils'

export { toast } from 'sonner'

type ToasterProps = ComponentProps<typeof ShadToaster> & NameProp

export function Toaster(props: ToasterProps) {
  return <ShadToaster data-testid={testIdFromProps('toaster', props)} {...props} />
}
