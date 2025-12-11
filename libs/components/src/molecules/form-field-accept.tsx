/* eslint-disable @typescript-eslint/max-lines-per-function */

import { cn } from "@monorepo/utils";
import { useCallback, useId } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import type { z } from "zod";
import { Label } from "../atoms/label";
import { RadioGroup, RadioGroupItem } from "../atoms/radio-group";
import { IconAccept } from "../icons/icon-accept";
import { IconReject } from "../icons/icon-reject";
import { checkZodBoolean, getFieldMetadataOrThrow } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldAccept({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { state = "editable" } = metadata;
  const { isBoolean, isBooleanLiteral } = checkZodBoolean(fieldSchema as z.ZodBoolean | z.ZodLiteral | z.ZodOptional<z.ZodBoolean>);
  const isDisabled = state === "disabled" || readonly || isBooleanLiteral;
  if (!isBoolean) {
    throw new Error(`Field "${fieldName}" is not a boolean`);
  }
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly };
  const idAccept = useId();
  const idReject = useId();
  const buttonClasses = cn("flex items-center space-x-2 border rounded-md px-4 py-3", {
    "cursor-pointer hover:bg-gray-50": state === "editable",
  });
  const iconClasses = cn("table bg-current/10 rounded p-2", { "bg-current/0": isDisabled });
  const labelClasses = cn({ "cursor-pointer": state === "editable" });
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
      {field => (
        <RadioGroup className="flex" disabled={isDisabled} name={field.name} onValueChange={value => field.onChange(value === "accepted")} value={initialValue(field)}>
          <div className={buttonClasses}>
            <RadioGroupItem id={idAccept} name={field.name} value="accepted" />
            <Label className={labelClasses} htmlFor={idAccept}>
              <div className={cn("text-green-600", iconClasses)}>
                <IconAccept />
              </div>
              Accept
            </Label>
          </div>
          <div className={buttonClasses}>
            <RadioGroupItem id={idReject} name={field.name} value="rejected" />
            <Label className={labelClasses} htmlFor={idReject}>
              <div className={cn("text-red-600", iconClasses)}>
                <IconReject />
              </div>
              Reject
            </Label>
          </div>
        </RadioGroup>
      )}
    </FormFieldBase>
  );
}
