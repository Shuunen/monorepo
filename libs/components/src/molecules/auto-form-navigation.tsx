import { Button } from '../atoms/button'

type AutoFormNavigationProps = {
  leftButton?: {
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

export function AutoFormNavigation({ leftButton, rightButton }: AutoFormNavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      {leftButton ? (
        <Button disabled={leftButton.disabled} onClick={leftButton.onClick} testId="step-back" type="button" variant="outline">
          Back
        </Button>
      ) : (
        <div />
      )}
      {rightButton && (
        <Button disabled={rightButton.disabled} onClick={rightButton.onClick} testId={rightButton.testId} type={rightButton.type || 'button'}>
          {rightButton.label}
        </Button>
      )}
    </div>
  )
}
