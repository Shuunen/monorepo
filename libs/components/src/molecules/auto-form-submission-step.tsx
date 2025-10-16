import { Link } from '@tanstack/react-router'
import { type ReactNode, useMemo } from 'react'
import { Button } from '../atoms/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../atoms/tooltip'
import { IconError } from '../icons/icon-error'
import { IconHome } from '../icons/icon-home'
import { IconLoading } from '../icons/icon-loading'
import { IconSuccess } from '../icons/icon-success'
import { IconTooltip } from '../icons/icon-tooltip'
import { IconWarning } from '../icons/icon-warning'
import { cn } from '../shadcn/utils'

type Props = {
  /** The message or content to display in the step */
  children: ReactNode
  labels?: {
    loading?: string
    success?: string
    warning?: string
    error?: string
  }
  /** A list of details to add to the status message */
  detailsList?: string[]
  /** The actual status of the submission */
  status: 'loading' | 'success' | 'warning' | 'error' | 'unknown-error'
  /** A list of details to add to a tooltip to give some context to the user */
  tooltipDetailsList?: string[]
}

// oxlint-disable-next-line max-lines-per-function
export function AutoFormSubmissionStep({ status, detailsList = [], tooltipDetailsList = [], children, labels }: Props) {
  const title = useMemo(() => {
    if (status === 'loading') return 'Please wait...'
    if (status === 'success') return 'Success'
    if (status === 'warning') return 'Warning'
    if (status === 'error') return 'Error'
    return 'Unknown error'
  }, [status])

  const icon = useMemo(() => {
    if (status === 'loading') return
    if (status === 'success') return <IconSuccess />
    if (status === 'warning') return <IconWarning />
    return <IconError />
  }, [status])

  const color = useMemo(() => {
    if (status === 'loading') return cn('text-inherit')
    if (status === 'success') return cn('text-success')
    if (status === 'warning') return cn('text-warning')
    return cn('text-destructive')
  }, [status])

  const button = useMemo(() => {
    if (status === 'loading')
      return (
        <Button disabled={true} testId="app-status-btn-loading">
          {<IconLoading />} {labels?.loading ?? 'Submitting...'}
        </Button>
      )
    if (status === 'success' || status === 'warning')
      return (
        <Button asChild testId="app-status-btn-home">
          <Link search={{ guard: false }} to="/">
            <IconHome /> {status === 'success' ? (labels?.success ?? 'Return to Homepage') : (labels?.warning ?? 'Return to Homepage')}
          </Link>
        </Button>
      )
    return (
      <Button asChild testId="app-status-btn-cancel" variant="outline">
        <Link to="/">{labels?.error ?? 'Cancel'}</Link>
      </Button>
    )
  }, [status, labels])

  return (
    <div className="grid gap-4" data-testid={`app-status-${status}`}>
      <h1 className={cn('text-xl font-bold flex gap-3 items-center', color)}>
        {icon}
        {title}
        {tooltipDetailsList.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger testId="tooltip-details-list">
                <IconTooltip />
              </TooltipTrigger>
              <TooltipContent>
                <ul className="list-disc ml-6">
                  {tooltipDetailsList.map(detail => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </h1>
      {children}
      {detailsList.length > 0 && (
        <ul className="list-disc ml-6">
          {detailsList.map(detail => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
      <div className="pt-2">{button}</div>
    </div>
  )
}
