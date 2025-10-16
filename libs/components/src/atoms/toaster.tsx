import type { ComponentProps } from 'react'
import { Toaster as ShadToaster } from '../shadcn/sonner'

export { toast } from 'sonner'

type ToasterProps = ComponentProps<typeof ShadToaster> & {
  testId?: string
}

export function Toaster(props: ToasterProps) {
  return <ShadToaster data-testid={props.testId} {...props} />
}
