import { Button } from '../atoms/button'

type AutoFormNavigationProps = {
  currentStep: number
  isLastStep: boolean
  isSubmitDisabled?: boolean
  onBack: () => void
  onNext: () => void
}

export function AutoFormNavigation({ currentStep, isLastStep, isSubmitDisabled, onBack, onNext }: AutoFormNavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      {currentStep > 0 ? (
        <Button onClick={onBack} testId="step-back" type="button" variant="outline">
          Back
        </Button>
      ) : (
        <div />
      )}
      {isLastStep ? (
        <Button disabled={isSubmitDisabled} testId="step-submit" type="submit">
          Submit
        </Button>
      ) : (
        <Button onClick={onNext} testId="step-next" type="button">
          Next
        </Button>
      )}
    </div>
  )
}
