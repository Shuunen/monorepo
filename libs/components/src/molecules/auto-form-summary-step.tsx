import { Alert } from '../atoms/alert'
import { DebugData } from './debug-data'

type Props = {
  data?: Record<string, unknown>
  message: string
}

export function AutoFormSummaryStep(props: Props) {
  return (
    <div className="grid gap-6" data-testid="auto-form-summary-step">
      <Alert title="Coming soon" type="info">
        {props.message}
        {props.data && <DebugData data={props.data} />}
      </Alert>
    </div>
  )
}
