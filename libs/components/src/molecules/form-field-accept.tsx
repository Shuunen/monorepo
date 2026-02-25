import { useCallback } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import type { z } from "zod";
import { RadioGroup, RadioGroupChoiceCard } from "../atoms/radio-group";
import { IconAccept } from "../icons/icon-accept";
import { IconReject } from "../icons/icon-reject";
import type { AutoFormFieldAcceptMetadata } from "./auto-form.types";
import { checkZodBoolean, getFieldMetadataOrThrow } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldAccept({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema) as AutoFormFieldAcceptMetadata;
  const { state = "editable" } = metadata;
  const { isBoolean, isBooleanLiteral } = checkZodBoolean(
    fieldSchema as z.ZodBoolean | z.ZodLiteral | z.ZodOptional<z.ZodBoolean>,
  );
  const isDisabled = state === "disabled" || readonly || isBooleanLiteral;
  if (!isBoolean) {
    throw new Error(`Field "${fieldName}" is not a boolean`);
  }
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  const initialValue = useCallback((field: ControllerRenderProps) => {
    if (field.value === true) {
      return "accepted";
    }
    if (field.value === false) {
      return "rejected";
    }
    return undefined;
  }, []);
  return (
    <FormFieldBase {...props}>
      {({ field }) => (
        <RadioGroup
          className="flex"
          disabled={isDisabled}
          name={field.name}
          onValueChange={value => field.onChange(value === "accepted")}
          value={initialValue(field)}
        >
          <RadioGroupChoiceCard
            disabled={isDisabled}
            icon={IconAccept}
            iconColor="text-success"
            label={metadata.labels?.accept ?? "Accept"}
            name={field.name}
            value="accepted"
          />
          <RadioGroupChoiceCard
            disabled={isDisabled}
            icon={IconReject}
            iconColor="text-destructive"
            label={metadata.labels?.reject ?? "Reject"}
            name={field.name}
            value="rejected"
          />
        </RadioGroup>
      )}
    </FormFieldBase>
  );
}
