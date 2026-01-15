import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Alert } from "../atoms/alert";
import type { AutoFormData } from "./auto-form.types";
import { getFieldMetadata, getFormFieldRender, isFieldVisible, parseDependsOn } from "./auto-form.utils";
import { type AutoFormFieldProps, componentRegistry } from "./auto-form-field.utils";
import { FormFieldFieldList } from "./form-field-field-list";
import { FormFieldSection } from "./form-field-section";

// oxlint-disable-next-line max-lines-per-function max-statements
export function AutoFormField({ fieldName, fieldSchema, stepState, logger, showForm }: AutoFormFieldProps) {
  const { watch, getValues } = useFormContext();
  const metadata = getFieldMetadata(fieldSchema) ?? {};

  const hasIsVisible = metadata && "isVisible" in metadata && metadata.isVisible;
  const dependencyFieldName = metadata && "dependsOn" in metadata && metadata.dependsOn ? parseDependsOn(metadata.dependsOn).fieldName : undefined;

  let formValues: AutoFormData = {};

  if (dependencyFieldName) {
    const dependencyValue = watch(dependencyFieldName);
    formValues = { ...getValues(), [dependencyFieldName]: dependencyValue };
    logger?.debug(`[${fieldName}] dependsOn ${dependencyFieldName}:`, dependencyValue);
  } else if (hasIsVisible) {
    formValues = watch();
    logger?.debug(`[${fieldName}] isVisible: watching all`);
  } else {
    formValues = getValues();
  }

  if (!isFieldVisible(fieldSchema, formValues)) {
    return;
  }

  logger?.info("Rendering field", fieldName);
  const isOptional = fieldSchema instanceof z.ZodOptional;
  const fieldState = "state" in metadata ? metadata.state : undefined;
  const state = fieldState ?? stepState ?? "editable";
  const props = { fieldName, fieldSchema, isOptional, logger, readonly: state === "readonly", showForm };
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
