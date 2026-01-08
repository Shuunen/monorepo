import type { Logger } from "@monorepo/utils";
import type { z } from "zod";
import type { AutoFormStepMetadata } from "./auto-form.types";
import { AutoFormField } from "./auto-form-field";

type AutoFormFieldsProps = {
  schema: z.ZodObject;
  formData: Record<string, unknown>;
  /** The state of the current step : 'readonly', 'editable', 'upcoming' */
  state?: AutoFormStepMetadata["state"];
  /** The logger instance to use if any */
  logger?: Logger;
  showForm?: (schema: z.ZodObject, onSubmit: (data: Record<string, unknown>) => void) => void;
};

export function AutoFormFields({ schema, formData, state: stepState, logger, showForm }: AutoFormFieldsProps) {
  return (
    <>
      {Object.keys(schema.shape).map(fieldName => (
        <AutoFormField fieldName={fieldName} fieldSchema={schema.shape[fieldName] as z.ZodTypeAny} formData={formData} key={fieldName} logger={logger} showForm={showForm} stepState={stepState} />
      ))}
    </>
  );
}
