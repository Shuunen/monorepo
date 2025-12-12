import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Paragraph } from "../atoms/typography";
import { AutoFormSubmissionStep } from "./auto-form-submission-step";

const meta = {
  component: AutoFormSubmissionStep,
  parameters: {
    layout: "centered",
  },
  title: "Commons/Molecules/AutoFormSubmissionStep",
} satisfies Meta<typeof AutoFormSubmissionStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    children: (
      <Paragraph>
        Your order <strong className="font-medium">XX11234654</strong> is being submitted, please wait until the process is finished.
      </Paragraph>
    ),
    status: "loading",
  },
};

export const Success: Story = {
  args: {
    children: (
      <Paragraph>
        Your order <strong className="font-medium">XX1123465111</strong> has been successfully submitted.
      </Paragraph>
    ),
    status: "success",
  },
};

export const SuccessWithDetails: Story = {
  args: {
    children: (
      <Paragraph>
        Your order <strong className="font-medium">XX112346545</strong> has been successfully submitted.
      </Paragraph>
    ),
    detailsList: ["Your order was processed without issues."],
    status: "success",
    tooltipDetailsList: ["All checks passed."],
  },
};

export const WarningWithDetails: Story = {
  args: {
    children: (
      <Paragraph>
        Your order <strong className="font-medium">XX1123465423</strong> has been successfully submitted with some warnings.
      </Paragraph>
    ),
    detailsList: ["Some optional documents were missing."],
    status: "warning",
    tooltipDetailsList: ["Submission succeeded, but review required."],
  },
};

export const ErrorWithDetails: Story = {
  args: {
    children: (
      <Paragraph>
        Your order <strong className="font-medium">XX1123465433</strong> was not submitted, some errors prevent it from being processed:
      </Paragraph>
    ),
    detailsList: ["Document X is invalid.", "Please contact support."],
    status: "error",
    tooltipDetailsList: ["Critical error encountered."],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole("heading");
    expect(title.textContent).toContain("Error");
    const reference = canvas.getByRole("strong");
    expect(reference.textContent).toBe("XX1123465433");
    const tooltipTrigger = canvas.getByTestId("tooltip-trigger-details-list");
    expect(tooltipTrigger).toBeInTheDocument();
  },
};

export const UnknownErrorWithDetails: Story = {
  args: {
    children: (
      <Paragraph>
        Your order <strong className="font-medium">XX1123465466</strong> was not submitted, an unknown error occurred.
      </Paragraph>
    ),
    detailsList: ["An unexpected error occurred."],
    status: "unknown-error",
    tooltipDetailsList: ["No further information available."],
  },
};
