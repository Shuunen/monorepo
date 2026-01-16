import type { ReactNode } from "react";
import { IconEdit } from "../icons/icon-edit";
import { IconSuccess } from "../icons/icon-success";
import { IconUpcoming } from "../icons/icon-upcoming";
import type { AutoFormProps, AutoFormStepMetadata } from "./auto-form.types";

export const defaultLabels = {
  homeButton: "Return to Homepage",
  lastStepButton: "Submit",
  nextStep: "Next",
  previousStep: "Back",
  summaryStepButton: "Proceed",
} satisfies AutoFormProps["labels"];

export const defaultIcons = {
  editable: <IconEdit className="size-6 text-muted-foreground" />,
  readonly: <IconSuccess className="size-6 text-success" />,
  upcoming: <IconUpcoming className="size-6 text-muted-foreground" />,
} satisfies Record<NonNullable<AutoFormStepMetadata["state"]>, ReactNode>;
