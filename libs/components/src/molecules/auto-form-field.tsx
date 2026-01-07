import type { Logger } from "@monorepo/utils";
import { z } from "zod";
import { Alert } from "../atoms/alert";
import type { AutoFormStepMetadata } from "./auto-form.types";
import { getFieldMetadata, getFormFieldRender, isFieldVisible } from "./auto-form.utils";
import { FormFieldAccept } from "./form-field-accept";
import { FormFieldBoolean } from "./form-field-boolean";
import { FormFieldDate } from "./form-field-date";
import { FormFieldFormList } from "./form-field-form-list";
import { FormFieldNumber } from "./form-field-number";
import { FormFieldPassword } from "./form-field-password";
import { FormFieldSection } from "./form-field-section";
import { FormFieldSelect } from "./form-field-select";
import { FormFieldText } from "./form-field-text";
import { FormFieldTextarea } from "./form-field-textarea";
import { FormFieldUpload } from "./form-field-upload";

type AutoFormFieldProps = {
  fieldName: string;
  fieldSchema: z.ZodTypeAny;
  formData: Record<string, unknown>;
  stepState?: AutoFormStepMetadata["state"];
  logger?: Logger;
};

// oxlint-disable-next-line max-statements
export function AutoFormField({ fieldName, fieldSchema, formData, stepState, logger }: AutoFormFieldProps) {
  if (!isFieldVisible(fieldSchema, formData)) {
    return;
  }
  logger?.info("Rendering field", fieldName);
  const isOptional = fieldSchema instanceof z.ZodOptional;
  const metadata = getFieldMetadata(fieldSchema) ?? {};
  const fieldState = "state" in metadata ? metadata.state : undefined;
  const state = fieldState ?? stepState ?? "editable";
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly: state === "readonly" };
  const render = getFormFieldRender(fieldSchema);
  if (render === "accept") {
    return <FormFieldAccept {...props} />;
  }
  if (render === "boolean") {
    return <FormFieldBoolean {...props} />;
  }
  if (render === "date") {
    return <FormFieldDate {...props} />;
  }
  if (render === "number") {
    return <FormFieldNumber {...props} />;
  }
  if (render === "password") {
    return <FormFieldPassword {...props} />;
  }
  if (render === "section") {
    return <FormFieldSection {...metadata} />;
  }
  if (render === "select") {
    return <FormFieldSelect {...props} />;
  }
  if (render === "text") {
    return <FormFieldText {...props} />;
  }
  if (render === "textarea") {
    return <FormFieldTextarea {...props} />;
  }
  if (render === "upload") {
    return <FormFieldUpload {...props} />;
  }
  if (render === "form-list") {
    return <FormFieldFormList {...props} />;
  }
  return <Alert title={`Missing render "${render}" for field "${fieldName}"`} type="error" />;
}
