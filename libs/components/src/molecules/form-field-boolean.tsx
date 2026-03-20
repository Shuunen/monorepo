import { Checkbox } from "../atoms/checkbox";
import { FormControl, FormDescription } from "../atoms/form";
import { Switch } from "../atoms/switch";
import { cn } from "../shadcn/utils";
import { getFieldMetadataOrThrow, isZodBoolean } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { FormFieldLabel } from "./form-field.utils";

export function FormFieldBoolean({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable", label } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const isCheckbox = "render" in metadata && metadata.render === "checkbox";
  if (!isZodBoolean(fieldSchema)) {
    throw new Error(`Field "${fieldName}" is not a boolean`);
  }
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props} showLabel={false}>
      {({ field }) => {
        const commonProps = {
          ...field,
          checked: Boolean(field.value),
          disabled: isDisabled,
          onCheckedChange: field.onChange,
        };
        return (
          <div className="mt-2 grid gap-2">
            <div className={cn("flex gap-2", { "items-center": isCheckbox })}>
              <FormControl>{isCheckbox ? <Checkbox {...commonProps} /> : <Switch {...commonProps} />}</FormControl>
              <FormFieldLabel
                name={fieldName}
                className={cn({ "cursor-pointer": !isDisabled })}
                isOptional={isOptional}
                label={label}
              />
            </div>
            {placeholder && <FormDescription name={fieldName}>{placeholder}</FormDescription>}
          </div>
        );
      }}
    </FormFieldBase>
  );
}
