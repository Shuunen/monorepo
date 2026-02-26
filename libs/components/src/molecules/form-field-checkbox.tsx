import { Checkbox } from "../atoms/checkbox";
import { FormControl, FormDescription } from "../atoms/form";
import { cn } from "../shadcn/utils";
import { getFieldMetadataOrThrow, isZodBoolean } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { FormFieldLabel } from "./form-field.utils";

export function FormFieldCheckbox({
  fieldName,
  fieldSchema,
  isOptional,
  logger,
  readonly = false,
}: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable", label } = metadata;
  const isDisabled = state === "disabled" || readonly;
  if (!isZodBoolean(fieldSchema)) {
    throw new Error(`Field "${fieldName}" is not a boolean`);
  }
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props} showLabel={false}>
      {({ field }) => (
        <div className="mt-2 grid gap-2">
          <div className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                checked={Boolean(field.value)}
                disabled={isDisabled}
                name={fieldName}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            {/* we set optional to true all the times to hide the red star, does not make sense on a field that always have a value */}
            <FormFieldLabel className={cn({ "cursor-pointer": !isDisabled })} isOptional={true} label={label} />
          </div>
          {placeholder && <FormDescription name={fieldName}>{placeholder}</FormDescription>}
        </div>
      )}
    </FormFieldBase>
  );
}
