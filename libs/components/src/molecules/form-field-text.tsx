import { FormControl } from "../atoms/form";
import { Input } from "../atoms/input";
import { getFieldMetadataOrThrow } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldText({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <FormControl>
          {/* value={field.value || ""} We ensure that the value is always a string to prevent uncontrolled to controlled input warnings in React. */}
          <Input
            {...field}
            disabled={isDisabled}
            onBlur={() => {
              const trimmed = typeof field.value === "string" ? field.value.trim() : field.value;
              field.onChange(trimmed || undefined);
            }}
            placeholder={placeholder}
            readOnly={readonly}
            value={field.value || ""}
          />
        </FormControl>
      )}
    </FormFieldBase>
  );
}
