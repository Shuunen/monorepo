import type { Logger } from "@monorepo/utils";
import { useEffect, useMemo, useRef } from "react";
import {
  useFormContext,
  useWatch,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type UseFormStateReturn,
} from "react-hook-form";
import type { z } from "zod";
import { FormField, FormItem, FormMessage } from "../atoms/form";
import { cn } from "../shadcn/utils";
import type { AutoFormStepState, AutoFormSubformOptions } from "./auto-form.types";
import { getFieldMetadataOrThrow } from "./auto-form.utils";
import { computeCustomErrorMessage, getCustomErrorAction } from "./form-field-error.utils";
import "./form-field.css";
import { FormFieldLabel } from "./form-field.utils";

export type FormFieldBaseProps = {
  children?: (props: {
    field: ControllerRenderProps;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<FieldValues>;
  }) => React.ReactNode;
  fieldName: string;
  fieldSchema: z.ZodType;
  isOptional: boolean;
  stepState?: AutoFormStepState;
  readonly?: boolean;
  logger?: Logger;
  showLabel?: boolean;
  /** make auto-form switch from initial render mode to subform mode */
  showForm?: (options: AutoFormSubformOptions) => void;
};

export function FormFieldBase(props: FormFieldBaseProps) {
  const { children, fieldName, fieldSchema, isOptional } = props;
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const indented = metadata.dependsOn !== undefined || metadata.isVisible !== undefined;
  const customErrorFn = "errors" in metadata ? metadata.errors : undefined;
  const watchedValues = useWatch({ disabled: !customErrorFn });
  const { setError, clearErrors } = useFormContext();
  const lastCustomErrorRef = useRef<string | undefined>(undefined);
  const customErrorMessage = useMemo(
    () => computeCustomErrorMessage(customErrorFn, watchedValues),
    [watchedValues, customErrorFn],
  );
  useEffect(() => {
    const action = getCustomErrorAction(Boolean(customErrorFn), customErrorMessage, lastCustomErrorRef.current);
    if (action.type === "set-error") {
      lastCustomErrorRef.current = action.message;
      setError(fieldName, { message: action.message, type: "custom" });
    } else if (action.type === "clear-error") {
      lastCustomErrorRef.current = undefined;
      clearErrors(fieldName);
    }
  }, [customErrorMessage, customErrorFn, fieldName, setError, clearErrors]);
  return (
    <FormField
      key={fieldName}
      name={fieldName}
      render={({ field, fieldState, formState }) => (
        <FormItem
          className={cn("items-start py-2", {
            "indented border-l-2 pl-5": indented,
            "not-indented": !indented,
          })}
        >
          {props.showLabel !== false && <FormFieldLabel isOptional={isOptional} label={metadata.label} />}
          {children?.({ field, fieldState, formState })}
          <FormMessage name={fieldName}>{customErrorMessage}</FormMessage>
        </FormItem>
      )}
    />
  );
}
