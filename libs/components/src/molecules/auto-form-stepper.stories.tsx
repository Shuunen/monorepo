import type { Meta, StoryObj } from '@storybook/react'
import { useId, useState } from 'react'
import { defaultIcons } from './auto-form.utils'
import { AutoFormStepper } from './auto-form-stepper'

const meta: Meta<typeof AutoFormStepper> = {
  component: AutoFormStepper,
  title: 'Molecules/AutoFormStepper',
}

export default meta

type Story = StoryObj<typeof AutoFormStepper>

const successState = 'success' as const
const editableState = 'editable' as const
const readonlyState = 'readonly' as const
const { success: iconSuccess, edit: iconEdit, readonly: iconReadonly } = defaultIcons

/**
 * Basic stepper with title only
 */
export const Basic: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0)
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        title: 'Personal Information',
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        title: 'Contact Details',
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        state: editableState,
        title: 'Confirmation',
      },
    ]

    return (
      <div className="w-80">
        <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
      </div>
    )
  },
}

/**
 * Stepper with subtitles for additional context
 */
export const WithSubtitles: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0)
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        subtitle: 'Basic details about you',
        title: 'Personal Information',
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        subtitle: 'How we can reach you',
        title: 'Contact Details',
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        state: editableState,
        subtitle: 'Review and accept terms',
        title: 'Confirmation',
      },
    ]

    return (
      <div className="w-80">
        <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
      </div>
    )
  },
}

/**
 * Stepper with step number suffixes
 */
export const WithSuffixes: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0)
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        suffix: '1/4',
        title: 'Account Setup',
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        suffix: '2/4',
        title: 'Personal Details',
      },
      {
        active: activeStep === 2,
        icon: activeStep > 2 ? iconSuccess : iconEdit,
        idx: 2,
        state: activeStep > 2 ? successState : editableState,
        suffix: '3/4',
        title: 'Preferences',
      },
      {
        active: activeStep === 3,
        icon: iconEdit,
        idx: 3,
        state: editableState,
        suffix: '4/4',
        title: 'Review',
      },
    ]

    return (
      <div className="w-80">
        <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
      </div>
    )
  },
}

/**
 * Stepper with both subtitles and suffixes
 */
export const WithSubtitlesAndSuffixes: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0)
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        subtitle: 'Enter your shipping address',
        suffix: 'Step 1',
        title: 'Shipping',
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        subtitle: 'Enter payment information',
        suffix: 'Step 2',
        title: 'Payment',
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        state: editableState,
        subtitle: 'Review your order',
        suffix: 'Step 3',
        title: 'Review',
      },
    ]

    return (
      <div className="w-80">
        <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
      </div>
    )
  },
}

/**
 * Comprehensive example showcasing all stepper features:
 * - Different states (success, editable, readonly)
 * - Subtitles and suffixes
 * - Disabled mode toggle
 * - Various step counts (2, 3, 6 steps)
 * - Custom suffix formats (percentages, step numbers)
 */
export const Everything: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(2)
    const [isDisabled, setIsDisabled] = useState(false)
    const toggleId = useId()

    const steps = [
      {
        active: activeStep === 0,
        icon: iconSuccess,
        idx: 0,
        state: successState,
        subtitle: 'Name, email, phone',
        suffix: '1/6',
        title: 'Personal Info',
      },
      {
        active: activeStep === 1,
        icon: iconSuccess,
        idx: 1,
        state: successState,
        subtitle: 'Street, city, zip code',
        suffix: '2/6',
        title: 'Address',
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        state: editableState,
        subtitle: 'Choose your preferences',
        suffix: '3/6',
        title: 'Preferences',
      },
      {
        active: activeStep === 3,
        icon: iconReadonly,
        idx: 3,
        state: readonlyState,
        subtitle: 'View only, cannot edit',
        suffix: '4/6',
        title: 'Terms & Conditions',
      },
      {
        active: activeStep === 4,
        icon: activeStep > 4 ? iconSuccess : iconEdit,
        idx: 4,
        state: activeStep > 4 ? successState : editableState,
        subtitle: 'Card details and billing',
        suffix: '5/6',
        title: 'Payment',
      },
      {
        active: activeStep === 5,
        icon: activeStep > 5 ? iconSuccess : iconEdit,
        idx: 5,
        state: activeStep > 5 ? successState : editableState,
        subtitle: 'Review and submit',
        suffix: '6/6',
        title: 'Review',
      },
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <input checked={isDisabled} id={toggleId} onChange={e => setIsDisabled(e.target.checked)} type="checkbox" />
          <label className="text-sm" htmlFor={toggleId}>
            Disable stepper (e.g., during submission)
          </label>
        </div>

        <div className="w-80">
          <AutoFormStepper disabled={isDisabled} onStepClick={setActiveStep} steps={steps} />
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Features demonstrated:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Success state:</strong> Steps 1-2 (completed with checkmark)
            </li>
            <li>
              <strong>Editable state:</strong> Step 3, 5-6 (in progress, can edit)
            </li>
            <li>
              <strong>Readonly state:</strong> Step 4 (view only, locked)
            </li>
            <li>
              <strong>Subtitles:</strong> Additional context below each title
            </li>
            <li>
              <strong>Suffixes:</strong> Step numbers (1/6, 2/6, etc.)
            </li>
            <li>
              <strong>Disabled mode:</strong> Toggle above to disable all interactions
            </li>
            <li>
              <strong>Many steps:</strong> 6 steps showing scalability
            </li>
          </ul>
        </div>
      </div>
    )
  },
}
