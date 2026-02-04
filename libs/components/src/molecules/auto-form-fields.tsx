import type { Logger } from "@monorepo/utils";
import type { z } from "zod";
import { AutoFormField } from "./auto-form-field";
import type { AutoFormStepMetadata, AutoFormSubformOptions } from "./auto-form.types";

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
  const shape = schema.shape;
  const fields = Object.keys(shape);
  logger?.info("AutoFormFields displaying", { fields, shape });
  return (
    <>
      {fields.map(fieldName => {
        const fieldSchema = shape[fieldName];
        return (
          <AutoFormField
            fieldName={fieldName}
            fieldSchema={fieldSchema}
            key={fieldName}
            logger={logger}
            showForm={showForm}
            stepState={stepState}
          />
        );
      })}
    </>
  );
}
