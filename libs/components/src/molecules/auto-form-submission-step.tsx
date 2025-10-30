import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../atoms/tooltip'
import { Title } from '../atoms/typography'
import { IconError } from '../icons/icon-error'
import { IconSuccess } from '../icons/icon-success'
import { IconTooltip } from '../icons/icon-tooltip'
import { IconWarning } from '../icons/icon-warning'
import { cn } from '../shadcn/utils'
import type { AutoFormSubmissionStepProps } from './auto-form.types'

function getTitleByStatus(status: AutoFormSubmissionStepProps['status']) {
  if (status === 'loading') return 'Please wait...'
  if (status === 'success') return 'Success'
  if (status === 'warning') return 'Warning'
  if (status === 'error') return 'Error'
  return 'Unknown error'
}

function getIconByStatus(status: AutoFormSubmissionStepProps['status']) {
  if (status === 'loading') return
  if (status === 'success') return <IconSuccess />
  if (status === 'warning') return <IconWarning />
  return <IconError />
}

function getColorByStatus(status: AutoFormSubmissionStepProps['status']) {
  if (status === 'loading') return cn('text-inherit')
  if (status === 'success') return cn('text-success')
  if (status === 'warning') return cn('text-warning')
  return cn('text-destructive')
}

export function AutoFormSubmissionStep({ status, detailsList = [], tooltipDetailsList = [], children }: AutoFormSubmissionStepProps) {
  const title = useMemo(() => getTitleByStatus(status), [status])
  const icon = useMemo(() => getIconByStatus(status), [status])
  const color = useMemo(() => getColorByStatus(status), [status])
  return (
    <div className="grid gap-4" data-testid={`app-status-${status}`}>
      <Title className={cn('flex gap-3 items-center', color)} level={1}>
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
      </Title>
      {children}
      {detailsList.length > 0 && (
        <ul className="list-disc ml-6">
          {detailsList.map(detail => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
