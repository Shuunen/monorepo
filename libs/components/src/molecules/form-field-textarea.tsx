import { FormControl } from "../atoms/form";
import { Textarea } from "../atoms/textarea";
import { getFieldMetadataOrThrow } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldTextarea({
  fieldName,
  fieldSchema,
  isOptional,
  logger,
  readonly = false,
}: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <FormControl>
          <Textarea
            {...field}
            disabled={isDisabled}
            placeholder={placeholder}
            onBlur={() => {
              const trimmed = typeof field.value === "string" ? field.value.trim() : field.value;
              field.onChange(trimmed || undefined);
            }}
            readOnly={readonly}
            value={field.value || ""}
          />
        </FormControl>
      )}
    </FormFieldBase>
  );
}
