import { useState } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { FormControl } from "../atoms/form";
import { Input } from "../atoms/input";
import { getFieldMetadataOrThrow, isZodNumber } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

function NumberInput({ field, disabled, placeholder }: { field: ControllerRenderProps; disabled: boolean; placeholder?: string }) {
  const [localValue, setLocalValue] = useState(() => (field.value === undefined || field.value === null ? "" : String(field.value)));

  return (
    <FormControl>
      <Input
        type="number"
        {...field}
        disabled={disabled}
        onChange={event => {
          const value = event.target.value;
          setLocalValue(value);
          field.onChange(value === "" ? undefined : Number(value));
        }}
        placeholder={placeholder}
        value={localValue}
      />
    </FormControl>
  );
}

export function FormFieldNumber({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  if (!isZodNumber(fieldSchema)) {
    throw new Error(`Field "${fieldName}" is not a number`);
  }
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return <FormFieldBase {...props}>{({ field }) => <NumberInput disabled={isDisabled} field={field} placeholder={placeholder} />}</FormFieldBase>;
}
