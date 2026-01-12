import { z } from "zod";
import { Alert } from "../atoms/alert";
import { getFieldMetadata, getFormFieldRender, isFieldVisible } from "./auto-form.utils";
import { type AutoFormFieldProps, componentRegistry } from "./auto-form-field.utils";
import { FormFieldFieldList } from "./form-field-field-list";
import { FormFieldSection } from "./form-field-section";

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

  if (render === "section") {
    return <FormFieldSection {...metadata} />;
  }

  if (render === "field-list") {
    return <FormFieldFieldList {...props} />;
  }

  if (!render) {
    return <Alert title={`Missing render for field "${fieldName}"`} type="error" />;
  }

  const Component = componentRegistry[render];

  return <Component {...props} />;
}
