import { dateIso10 } from "@monorepo/utils";
import { FormControl } from "../atoms/form";
import { getFieldMetadataOrThrow, isZodString } from "./auto-form.utils";
import { DatetimePicker } from "./datetime-picker";
import { formatTime } from "./datetime-picker.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { normalizeToDate } from "./form-field-date.utils";

export function FormFieldDate({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { state = "editable" } = metadata;
  const isDisabled = state === "disabled" || state === "readonly" || readonly;
  const outputString = isZodString(fieldSchema);
  const render = "render" in metadata ? (metadata.render as "date" | "date-time" | "time") : undefined;
  const mode = render ?? "date";
  const defaultToNoon = "defaultToNoon" in metadata ? metadata.defaultToNoon === true : false;
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <FormControl>
          <DatetimePicker
            name={fieldName}
            mode={mode}
            readonly={isDisabled}
            defaultToNoon={defaultToNoon}
            defaultValue={normalizeToDate(field.value)}
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
