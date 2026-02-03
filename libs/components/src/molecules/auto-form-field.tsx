import { memo, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { Alert } from "../atoms/alert";
import { type AutoFormFieldProps, componentRegistry } from "./auto-form-field.utils";
import type { AutoFormData } from "./auto-form.types";
import { getFieldMetadata, getFormFieldRender, isFieldVisible, parseDependsOn } from "./auto-form.utils";
import { FormFieldFieldList } from "./form-field-field-list";
import { FormFieldSection } from "./form-field-section";

// oxlint-disable-next-line max-lines-per-function max-statements
export const AutoFormField = memo(({ fieldName, fieldSchema, stepState, logger, showForm }: AutoFormFieldProps) => {
  const { getValues } = useFormContext();
  const metadata = getFieldMetadata(fieldSchema) ?? {};

  const hasIsVisible = metadata && "isVisible" in metadata && metadata.isVisible;
  const dependenciesFieldName = useMemo(
    () =>
      metadata && "dependsOn" in metadata && metadata.dependsOn
        ? // oxlint-disable-next-line max-nested-callbacks
          parseDependsOn(metadata.dependsOn).map(dependency => dependency.fieldName)
        : undefined,
    [metadata],
  );

  const watchedDependencies = useWatch({ disabled: !dependenciesFieldName, name: dependenciesFieldName as string[] });
  const watchedAll = useWatch({ disabled: !hasIsVisible });

  const formValues: AutoFormData = useMemo(() => {
    if (dependenciesFieldName) {
      const updatedDependencies: Record<string, unknown> = {};
      for (const [index, dependencyFieldName] of dependenciesFieldName.entries()) {
        updatedDependencies[dependencyFieldName] = watchedDependencies[index];
      }
      return { ...getValues(), ...updatedDependencies };
    }
    if (hasIsVisible) {
      return typeof watchedAll === "object" && watchedAll !== null ? watchedAll : getValues();
    }
    return getValues();
  }, [dependenciesFieldName, hasIsVisible, watchedDependencies, watchedAll, getValues]);

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
});
