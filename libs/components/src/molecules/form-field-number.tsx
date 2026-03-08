import { useEffect, useState } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { FormControl } from "../atoms/form";
import { Input } from "../atoms/input";
import { getFieldMetadataOrThrow, getUnwrappedSchema, isZodNumber } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { getZodNumberMinMax, toLocalValue } from "./form-field-number.utils";
import type { z } from "zod";

type NumberInputProps = {
  field: ControllerRenderProps;
  disabled: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
};

function NumberInput({ field, disabled, placeholder, min, max }: NumberInputProps) {
  const [localValue, setLocalValue] = useState(() => toLocalValue(field.value));
  useEffect(() => {
    setLocalValue(toLocalValue(field.value));
  }, [field.value]);

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
        min={min}
        max={max}
      />
    </FormControl>
  );
}

// oxlint-disable-next-line react/no-multi-comp
export function FormFieldNumber({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const schema = getUnwrappedSchema(fieldSchema);
  if (!isZodNumber(schema)) {
    throw new Error(`Field "${fieldName}" is not a number`);
  }
  const { min, max } = getZodNumberMinMax(schema as z.ZodNumber);
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };

  return (
    <FormFieldBase {...props}>
      {({ field }) => <NumberInput disabled={isDisabled} field={field} placeholder={placeholder} min={min} max={max} />}
    </FormFieldBase>
  );
}
