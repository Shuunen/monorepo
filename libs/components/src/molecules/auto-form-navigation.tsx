import { Button } from '../atoms/button'

type AutoFormNavigationProps = {
  leftButton?: {
    disabled?: boolean
    onClick: () => void
  }
  centerButton?: {
    disabled?: boolean
    onClick: () => void
  }
  rightButton?: {
    label: string
    disabled?: boolean
    onClick?: () => void
    type?: 'submit'
    testId: string
  }
}

export function AutoFormNavigation({ leftButton, centerButton, rightButton }: AutoFormNavigationProps) {
  return (
    <div className="flex justify-between pt-6 gap-2">
      {leftButton ? (
        <Button disabled={leftButton.disabled} onClick={leftButton.onClick} testId="step-back" type="button" variant="outline">
          Back
        </Button>
      ) : (
        <div />
      )}
      <div className="flex gap-2">
        {centerButton && (
          <Button disabled={centerButton.disabled} onClick={centerButton.onClick} testId="step-cancel" type="button" variant="outline">
            Cancel
          </Button>
        )}
        {rightButton && (
          <Button disabled={rightButton.disabled} onClick={rightButton.onClick} testId={rightButton.testId} type={rightButton.type || 'button'}>
            {rightButton.label}
          </Button>
        )}
      </div>
    </div>
  )
}
