import { cn } from "@monorepo/utils";
import { FormControl } from "../atoms/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../atoms/select";
import { getFieldMetadataOrThrow, getZodEnumOptions } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldSelect({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { label = "", placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const options = getZodEnumOptions(fieldSchema);
  if (!options.ok) {
    throw new Error(`Field "${fieldName}" is not an enum`);
  }

  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <FormControl>
          <Select {...field} disabled={isDisabled || readonly} onValueChange={field.onChange}>
            <SelectTrigger className={cn("max-w-full", { "opacity-100!": readonly })} name={field.name}>
              <SelectValue placeholder={placeholder ?? `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.value?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
      )}
    </FormFieldBase>
  );
}
