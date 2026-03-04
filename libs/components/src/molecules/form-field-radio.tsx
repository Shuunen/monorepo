import { FormControl } from "../atoms/form";
import { Label } from "../atoms/label";
import { RadioGroup, RadioGroupChoiceCard, RadioGroupItem } from "../atoms/radio-group";
import { Paragraph } from "../atoms/typography";
import { cn } from "../shadcn/utils";
import type { AutoFormFieldRadioMetadata } from "./auto-form.types";
import { getFieldMetadataOrThrow } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldRadio({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema) as AutoFormFieldRadioMetadata;
  if (!Array.isArray(metadata.options)) {
    throw new TypeError(`Field "${fieldName}" requires "options" in metadata`);
  }
  const { fullWidth = false, isVertical = true, state = "editable", variant = "default" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <FormControl>
          <RadioGroup
            {...field}
            className={cn({ "w-full": fullWidth })}
            disabled={isDisabled}
            name={field.name}
            // Prevent validation issue when the field is undefined the first time.
            onBlur={event => event.preventDefault()}
            onValueChange={field.onChange}
            value={field.value || ""}
          >
            {metadata.placeholder && <Paragraph className="mb-1">{metadata.placeholder}</Paragraph>}
            <div className={cn("grid gap-3", { "lg:auto-cols-fr lg:grid-flow-col": !isVertical })}>
              {metadata.options.map(option => {
                const itemId = `${fieldName}-${option.value}`;
                return variant === "default" ? (
                  <div className="flex items-center space-x-2" key={option.value}>
                    <RadioGroupItem
                      className={cn({ "opacity-100!": readonly })}
                      id={itemId}
                      name={field.name}
                      value={option.value}
                    />
                    <Label className={cn("font-normal", { "cursor-pointer": !isDisabled })} htmlFor={itemId}>
                      {option.label}
                    </Label>
                  </div>
                ) : (
                  <RadioGroupChoiceCard
                    key={option.value}
                    className={cn({ grow: fullWidth })}
                    description={option.description}
                    disabled={isDisabled}
                    icon={option.icon}
                    iconColor={option.iconColor}
                    label={option.label}
                    name={field.name}
                    value={option.value}
                  />
                );
              })}
            </div>
          </RadioGroup>
        </FormControl>
      )}
    </FormFieldBase>
  );
}
