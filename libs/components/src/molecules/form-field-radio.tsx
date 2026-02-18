import { FormControl } from "../atoms/form";
import { Label } from "../atoms/label";
import { RadioGroup, RadioGroupItem } from "../atoms/radio-group";
import { Paragraph } from "../atoms/typography";
import { cn } from "../shadcn/utils";
import { getFieldMetadataOrThrow, getZodEnumOptions } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldRadio({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { state = "editable", placeholder } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const options = getZodEnumOptions(fieldSchema);
  if (!options.ok) {
    throw new Error(`Field "${fieldName}" is not an enum`);
  }
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <FormControl>
          {/* Prevent onBlur triggering validation here because you could only select a valid option
          this prevent validation issue when the field is undefined the first time
          */}
          <RadioGroup
            {...field}
            disabled={isDisabled}
            name={field.name}
            onBlur={event => event.preventDefault()}
            onValueChange={field.onChange}
            value={field.value || ""}
          >
            {placeholder && <Paragraph className="mb-1">{placeholder}</Paragraph>}
            {options.value?.map(option => {
              const itemId = `${fieldName}-${option.value}`;
              return (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem
                    className={cn({ "opacity-100!": readonly })}
                    id={itemId}
                    name={`${field.name}-${option.value}`}
                    value={option.value}
                  />
                  <Label className={cn("font-normal", { "cursor-pointer": !isDisabled })} htmlFor={itemId}>
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </FormControl>
      )}
    </FormFieldBase>
  );
}
