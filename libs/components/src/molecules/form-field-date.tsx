import { FormControl } from "../atoms/form";
import { Input } from "../atoms/input";
import { getFieldMetadataOrThrow, isZodString } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldDate({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const outputString = isZodString(fieldSchema);
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {field => (
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
            value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : field.value || ""}
          />
        </FormControl>
      )}
    </FormFieldBase>
  );
}
