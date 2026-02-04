import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";
import { FormControl, FormDescription } from "../atoms/form";
import { Switch } from "../atoms/switch";
import { cn } from "../shadcn/utils";
import { checkZodBoolean, getFieldMetadataOrThrow } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { FormFieldLabel } from "./form-field.utils";

export function FormFieldBoolean({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const schema = ["default", "prefault"].includes(fieldSchema.type)
    ? ((fieldSchema as z.ZodDefault).unwrap() as z.ZodType).meta(metadata)
    : fieldSchema;
  const { placeholder, state = "editable", label } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const { booleanLiteralValue, isBoolean, isBooleanLiteral } = checkZodBoolean(
    schema as z.ZodBoolean | z.ZodLiteral | z.ZodOptional<z.ZodBoolean>,
  );
  if (!isBoolean) {
    throw new Error(`Field "${fieldName}" is not a boolean`);
  }
  const props = { fieldName, fieldSchema: schema, isOptional, logger, readonly };
  const { setValue, getValues } = useFormContext();
  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this once on mount
  useEffect(() => {
    const currentValue = getValues(fieldName);
    if (currentValue !== undefined || isOptional) {
      return;
    }
    logger?.debug("initializing boolean field value to false, it was undefined");
    setValue(fieldName, false);
  }, []);
  return (
    <FormFieldBase {...props} showLabel={false}>
      {({ field }) => (
        <div className="mt-2 grid gap-2">
          <div className="flex gap-2">
            <FormControl>
              {isBooleanLiteral ? (
                <Switch {...field} checked={booleanLiteralValue === true} disabled />
              ) : (
                <Switch
                  {...field}
                  checked={Boolean(field.value)}
                  disabled={isDisabled}
                  onCheckedChange={field.onChange}
                />
              )}
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
