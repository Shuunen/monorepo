import { dateIso10 } from "@monorepo/utils";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl } from "../atoms/form";
import { getFieldMetadataOrThrow, isZodString } from "./auto-form.utils";
import { DatetimePicker } from "./datetime-picker";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { getInitialValue } from "./form-field-date.utils";

function toDefaultValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }
  if (value) {
    return new Date(value as string);
  }
  return undefined;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0"); // oxlint-disable-line no-magic-numbers
  const minutes = String(date.getMinutes()).padStart(2, "0"); // oxlint-disable-line no-magic-numbers
  return `${hours}:${minutes}`;
}

export function FormFieldDate({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { state = "editable" } = metadata;
  const isDisabled = state === "disabled" || state === "readonly" || readonly;
  const outputString = isZodString(fieldSchema);
  const render = "render" in metadata ? metadata.render : undefined;
  const defaultToNoon = "defaultToNoon" in metadata ? metadata.defaultToNoon === true : false;
  let mode: "date" | "date-time" | "time" = "date";
  if (render === "date-time") {
    mode = "date-time";
  } else if (render === "time") {
    mode = "time";
  }
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
          <DatetimePicker
            name={fieldName}
            mode={mode}
            readonly={isDisabled}
            defaultToNoon={defaultToNoon}
            defaultValue={toDefaultValue(field.value)}
            onChange={date => {
              if (!date) {
                field.onChange(undefined);
                return;
              }
              if (outputString) {
                field.onChange(mode === "time" ? formatTime(date) : dateIso10(date));
              } else {
                field.onChange(date);
              }
            }}
          />
        </FormControl>
      )}
    </FormFieldBase>
  );
}
