import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { Skeleton } from "../atoms/skeleton";
import { defaultIcons } from "./auto-form.utils";
import { AutoFormStepper } from "./auto-form-stepper";

const meta: Meta<typeof AutoFormStepper> = {
  component: AutoFormStepper,
  parameters: {
    layout: "centered",
  },
  title: "Commons/Molecules/AutoFormStepper",
};

export default meta;

type Story = StoryObj<typeof AutoFormStepper>;

const successState = "success" as const;
const editableState = "editable" as const;
const readonlyState = "readonly" as const;
const upcomingState = "upcoming" as const;
const { success: iconSuccess, edit: iconEdit, readonly: iconReadonly, upcoming: iconUpcoming } = defaultIcons;

function FormSkeleton() {
  return (
    <div className="flex-1 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Basic stepper with title only
 */
export const Basic: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        title: "Personal Information",
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        title: "Contact Details",
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        state: editableState,
        title: "Confirmation",
      },
    ];

    return (
      <div className="flex gap-8">
        <div className="w-80">
          <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
        </div>
        <FormSkeleton />
      </div>
    );
  },
};

/**
 * Stepper with subtitles for additional context
 */
export const WithSubtitles: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        subtitle: "Basic details about you",
        title: "Personal Information",
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        subtitle: "How we can reach you",
        title: "Contact Details",
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        state: editableState,
        subtitle: "Review and accept terms",
        title: "Confirmation",
      },
    ];

    return (
      <div className="flex gap-8">
        <div className="w-80">
          <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
        </div>
        <FormSkeleton />
      </div>
    );
  },
};

/**
 * Stepper with step number suffixes
 */
export const WithSuffixes: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        suffix: "1/4",
        title: "Account Setup",
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        suffix: "2/4",
        title: "Personal Details",
      },
      {
        active: activeStep === 2,
        icon: activeStep > 2 ? iconSuccess : iconEdit,
        idx: 2,
        state: activeStep > 2 ? successState : editableState,
        suffix: "3/4",
        title: "Preferences",
      },
      {
        active: activeStep === 3,
        icon: iconEdit,
        idx: 3,
        state: editableState,
        suffix: "4/4",
        title: "Review",
      },
    ];

    return (
      <div className="flex gap-8">
        <div className="w-80">
          <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
        </div>
        <FormSkeleton />
      </div>
    );
  },
};

/**
 * Stepper with both subtitles and suffixes
 */
export const WithSubtitlesAndSuffixes: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
      {
        active: activeStep === 0,
        icon: activeStep > 0 ? iconSuccess : iconEdit,
        idx: 0,
        state: activeStep > 0 ? successState : editableState,
        subtitle: "Enter your shipping address",
        suffix: "- Step 1/3",
        title: "Shipping",
      },
      {
        active: activeStep === 1,
        icon: activeStep > 1 ? iconSuccess : iconEdit,
        idx: 1,
        state: activeStep > 1 ? successState : editableState,
        subtitle: "Enter payment information",
        suffix: "- Step 2/3",
        title: "Payment",
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        state: editableState,
        subtitle: "Review your order",
        suffix: "- Step 3/3",
        title: "Review",
      },
    ];

    return (
      <div className="flex gap-8">
        <div className="w-80">
          <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
        </div>
        <FormSkeleton />
      </div>
    );
  },
};

/**
 * Stepper with section headers to group related steps
 */
export const WithSections: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(2);
    const steps = [
      {
        active: activeStep === 0,
        icon: iconSuccess,
        idx: 0,
        section: "Getting Started",
        state: successState,
        title: "Create Account",
      },
      {
        active: activeStep === 1,
        icon: iconSuccess,
        idx: 1,
        state: successState,
        title: "Email Verification",
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        section: "Profile Setup",
        state: editableState,
        title: "Personal Information",
      },
      {
        active: activeStep === 3,
        icon: iconUpcoming,
        idx: 3,
        state: upcomingState,
        title: "Profile Picture",
      },
      {
        active: activeStep === 4,
        icon: iconUpcoming,
        idx: 4,
        section: "Preferences",
        state: upcomingState,
        title: "Notification Settings",
      },
      {
        active: activeStep === 5,
        icon: iconUpcoming,
        idx: 5,
        state: upcomingState,
        title: "Privacy Settings",
      },
    ];

    return (
      <div className="flex gap-8">
        <div className="w-80">
          <AutoFormStepper onStepClick={setActiveStep} steps={steps} />
        </div>
        <FormSkeleton />
      </div>
    );
  },
};

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
    const [activeStep, setActiveStep] = useState(2);
    const [isDisabled, setIsDisabled] = useState(false);
    const toggleId = useId();

    const steps = [
      {
        active: activeStep === 0,
        icon: iconSuccess,
        idx: 0,
        section: "Completed steps",
        state: successState,
        subtitle: "Name, email, phone",
        title: "Personal Info",
      },
      {
        active: activeStep === 1,
        icon: iconReadonly,
        idx: 1,
        state: readonlyState,
        subtitle: "Details you agreed to",
        title: "Terms & Conditions",
      },
      {
        active: activeStep === 2,
        icon: iconEdit,
        idx: 2,
        section: "To complete",
        state: editableState,
        subtitle: "Street, city, zip code",
        suffix: "- Part 1/2",
        title: "Address",
      },
      {
        active: activeStep === 3,
        icon: iconEdit,
        idx: 3,
        indent: true,
        state: editableState,
        subtitle: "State, country",
        suffix: "- Part 2/2",
        title: "Address",
      },
      {
        active: activeStep === 4,
        icon: iconUpcoming,
        idx: 4,
        section: "Upcoming steps",
        state: upcomingState,
        subtitle: "Payment method and details",
        suffix: "- FINAL",
        title: "Payment",
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex gap-8">
          <div className="w-80">
            <AutoFormStepper disabled={isDisabled} onStepClick={setActiveStep} steps={steps} />
          </div>
          <FormSkeleton />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex gap-2 cursor-pointer" htmlFor={toggleId}>
            <input checked={isDisabled} id={toggleId} onChange={e => setIsDisabled(e.target.checked)} type="checkbox" />
            Disable stepper (e.g., during submission)
          </label>
        </div>

        <div className="text-muted-foreground space-y-2">
          <p>
            <strong>Features demonstrated:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Success state:</strong> Steps 1 (completed with checkmark, readable)
            </li>
            <li>
              <strong>Readonly state:</strong> Step 2 (view only, readable not editable)
            </li>
            <li>
              <strong>Editable state:</strong> Step 3-4 (in progress, can edit)
            </li>
            <li>
              <strong>Indent state:</strong> Step 4 (indented to indicate link with previous step)
            </li>
            <li>
              <strong>Upcoming state:</strong> Step 5 (not started, upcoming with faded style)
            </li>
            <li>
              <strong>Subtitles:</strong> Additional context below each title (like "Name, email, phone")
            </li>
            <li>
              <strong>Suffixes:</strong> Additional context on the right (like "Part 1/2", "FINAL")
            </li>
            <li>
              <strong>Disabled mode:</strong> Toggle above to disable all steps
            </li>
          </ul>
        </div>
      </div>
    );
  },
};
