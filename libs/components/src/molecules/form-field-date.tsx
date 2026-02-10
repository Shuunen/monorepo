import { FormControl } from "../atoms/form";
import { Input } from "../atoms/input";
import { getFieldMetadataOrThrow, isZodString } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { getInitialValue } from "./form-field-date.utils";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { dateIso10 } from "@monorepo/utils";

export function FormFieldDate({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const outputString = isZodString(fieldSchema);
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  const { setValue, getValues } = useFormContext();
  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this once on mount
  useEffect(() => {
    const currentValue = getValues(fieldName);
    if (currentValue !== undefined || isOptional) {
      return;
    }
    const initialValue = getInitialValue(fieldSchema);
    if (initialValue === undefined) {
      return;
    }
    logger?.debug(`initializing date field "${fieldName}" value to "${initialValue}", it was undefined`);
    setValue(fieldName, initialValue);
  }, []);
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <FormControl>
          <Input
            {...field}
            className="w-auto"
            disabled={isDisabled}
            onChange={event => {
              const { value } = event.currentTarget;
              if (outputString) {
                field.onChange(value);
              } else {
                field.onChange(value ? new Date(value) : undefined);
              }
            }}
            placeholder={placeholder}
            readOnly={readonly}
            type="date"
            value={field.value instanceof Date ? dateIso10(field.value) : field.value || ""}
          />
        </FormControl>
      )}
    </FormFieldBase>
  );
}
