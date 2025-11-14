import { type ReactNode, useMemo } from 'react'
import { IconError } from '../icons/icon-error'
import { IconSuccess } from '../icons/icon-success'
import { IconTooltip } from '../icons/icon-tooltip'
import { IconWarning } from '../icons/icon-warning'
import { AlertDescription, AlertTitle, Alert as ShadAlert } from '../shadcn/alert'
import { cn } from '../shadcn/utils'

type AlertProps = {
  /**
   * The content / description / message of the alert
   */
  children?: ReactNode
  /**
   * The title of the alert, optional, will display "type" if no title provided
   * @example `title="Something went wrong"`
   */
  title?: string
  /**
   * The type of the alert will impact it's visual aspect : color, icon, ...
   */
  type: 'success' | 'warning' | 'error' | 'info'
}

export function Alert({ type, title, children }: AlertProps) {
  const content = useMemo(() => {
    if (type === 'info')
      return {
        icon: <IconTooltip />,
        title: title ?? 'Info',
      }

    if (type === 'success')
      return {
        classes: cn('text-success'),
        icon: <IconSuccess />,
        title: title ?? 'Success',
      }

    if (type === 'warning')
      return {
        classes: cn('text-warning'),
        icon: <IconWarning />,
        title: title ?? 'Warning',
      }

    return {
      classes: cn('text-destructive'),
      icon: <IconError />,
      title: title ?? 'Error',
      variant: 'destructive',
    } as const
  }, [type, title])

  return (
    <ShadAlert className={content.classes} data-testid={`alert-${type}`} variant={content.variant}>
      {content.icon}
      <AlertTitle>
        <strong>{content.title}</strong>
      </AlertTitle>
      {children && <AlertDescription className={content.classes}>{children}</AlertDescription>}
    </ShadAlert>
  )
}
