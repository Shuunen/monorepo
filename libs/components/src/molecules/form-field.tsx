import type { Logger } from "@monorepo/utils";
import type { ControllerFieldState, ControllerRenderProps, FieldValues, UseFormStateReturn } from "react-hook-form";
import type { z } from "zod";
import { FormField, FormItem, FormMessage } from "../atoms/form";
import { cn } from "../shadcn/utils";
import type { AutoFormSubformOptions } from "./auto-form.types";
import { getFieldMetadataOrThrow } from "./auto-form.utils";
import "./form-field.css";
import { FormFieldLabel } from "./form-field.utils";

export type FormFieldBaseProps = {
  children?: (props: { field: ControllerRenderProps; fieldState: ControllerFieldState; formState: UseFormStateReturn<FieldValues> }) => React.ReactNode;
  fieldName: string;
  fieldSchema: z.ZodType;
  isOptional: boolean;
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
          <FormMessage name={fieldName} />
        </FormItem>
      )}
    />
  );
}
