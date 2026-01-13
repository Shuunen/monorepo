import type { Logger } from "@monorepo/utils";
import type { ComponentType } from "react";
import type { z } from "zod";
import type { AutoFormStepMetadata, AutoFormSubformOptions } from "./auto-form.types";
import type { getFormFieldRender } from "./auto-form.utils";
import { FormFieldAccept } from "./form-field-accept";
import { FormFieldBoolean } from "./form-field-boolean";
import { FormFieldDate } from "./form-field-date";
import { FormFieldFormList } from "./form-field-form-list";
import { FormFieldNumber } from "./form-field-number";
import { FormFieldPassword } from "./form-field-password";
import { FormFieldSelect } from "./form-field-select";
import { FormFieldText } from "./form-field-text";
import { FormFieldTextarea } from "./form-field-textarea";
import { FormFieldUpload } from "./form-field-upload";

export type AutoFormFieldProps = {
  fieldName: string;
  fieldSchema: z.ZodTypeAny;
  formData: Record<string, unknown>;
  stepState?: AutoFormStepMetadata["state"];
  logger?: Logger;
  showForm?: (options: AutoFormSubformOptions) => void;
};

type FieldComponentProps = {
  fieldName: string;
  fieldSchema: z.ZodTypeAny;
  formData: Record<string, unknown>;
  isOptional: boolean;
  logger?: Logger;
  readonly: boolean;
};

type ComponentRegistry = {
  [RenderType in Exclude<NonNullable<ReturnType<typeof getFormFieldRender>>, "section" | "field-list">]: ComponentType<FieldComponentProps>;
};

/* c8 ignore start */
export const componentRegistry: ComponentRegistry = {
  accept: FormFieldAccept,
  boolean: FormFieldBoolean,
  date: FormFieldDate,
  "form-list": FormFieldFormList,
  number: FormFieldNumber,
  password: FormFieldPassword,
  select: FormFieldSelect,
  text: FormFieldText,
  textarea: FormFieldTextarea,
  upload: FormFieldUpload,
} as const;
/* c8 ignore stop */
