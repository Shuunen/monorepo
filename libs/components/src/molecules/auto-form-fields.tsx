import type { Logger } from "@monorepo/utils";
import type { z } from "zod";
import type { AutoFormStepMetadata, AutoFormSubformOptions } from "./auto-form.types";
import { AutoFormField } from "./auto-form-field";

type AutoFormFieldsProps = {
  schema: z.ZodObject;
  /** The state of the current step : 'readonly', 'editable', 'upcoming' */
  state?: AutoFormStepMetadata["state"];
  /** The logger instance to use if any */
  logger?: Logger;
  /** Make auto-form switch from initial render mode to subform mode */
  showForm?: (options: AutoFormSubformOptions) => void;
};

export function AutoFormFields({ schema, state: stepState, logger, showForm }: AutoFormFieldsProps) {
  return (
    <>
      {Object.keys(schema.shape).map(fieldName => (
        <AutoFormField fieldName={fieldName} fieldSchema={schema.shape[fieldName] as z.ZodType} key={fieldName} logger={logger} showForm={showForm} stepState={stepState} />
      ))}
    </>
  );
}
