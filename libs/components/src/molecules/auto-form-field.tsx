import { type Dispatch, type SetStateAction, memo, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Alert } from "../atoms/alert";
import { type AutoFormFieldProps, componentRegistry } from "./auto-form-field.utils";
import type { AutoFormData } from "./auto-form.types";
import { getFieldMetadata, getFormFieldRender, isFieldVisible } from "./auto-form.utils";
import { FormFieldFieldList } from "./form-field-field-list";
import { FormFieldSection } from "./form-field-section";

function createVisibilitySubscriber(fieldSchema: z.ZodTypeAny, setVisible: Dispatch<SetStateAction<boolean>>) {
  return (formValues: AutoFormData) => {
    const newVisible = isFieldVisible(fieldSchema, formValues);
    setVisible(prev => (prev === newVisible ? prev : newVisible));
  };
}

// oxlint-disable-next-line max-lines-per-function max-statements
export const AutoFormField = memo(({ fieldName, fieldSchema, stepState, logger, showForm }: AutoFormFieldProps) => {
  const { getValues, watch } = useFormContext();
  const metadata = getFieldMetadata(fieldSchema) ?? {};

  logger?.info("compute visibility for field", { fieldName });
  const hasIsVisible = metadata && "isVisible" in metadata && metadata.isVisible;
  const hasDependsOn = metadata && "dependsOn" in metadata && metadata.dependsOn;
  const needsWatch = hasIsVisible || hasDependsOn;

  const [visible, setVisible] = useState(() => isFieldVisible(fieldSchema, getValues()));

  useEffect(() => {
    if (!needsWatch) {
      return;
    }
    const subscription = watch(createVisibilitySubscriber(fieldSchema, setVisible));
    return () => subscription.unsubscribe();
  }, [fieldSchema, watch, needsWatch]);

  if (!visible) {
    return;
  }

  logger?.info("Rendering", { fieldName });
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
});
