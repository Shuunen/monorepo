import { arrayAlign, cn, Result, useStableKeys } from "@monorepo/utils";
import { invariant } from "es-toolkit";
import { useEffect, useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "../atoms/button";
import { Paragraph, Title } from "../atoms/typography";
import { IconMinus } from "../icons/icon-minus";
import { IconReject } from "../icons/icon-reject";
import { type AutoFormFieldProps, componentRegistry } from "./auto-form-field.utils";
import type { AutoFormFieldsMetadata } from "./auto-form.types";
import { getElementSchema, getFieldMetadata, getFormFieldRender, typeLikeResolver } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

function AutoFormField({
  fieldName,
  fieldSchema,
  stepState,
  state,
  logger,
  readonly,
}: AutoFormFieldProps & { readonly: boolean; state?: AutoFormFieldsMetadata["state"] }) {
  if (fieldSchema === undefined) {
    return (
      <Paragraph>
        Cannot render field <strong>{fieldName}</strong> with an undefined fieldSchema
      </Paragraph>
    );
  }
  const isOptional = fieldSchema instanceof z.ZodOptional;
  const metadata = getFieldMetadata(fieldSchema) ?? {};
  const fieldState = "state" in metadata ? metadata.state : undefined;
  const finalState = fieldState ?? state ?? stepState ?? "editable";
  const props = { fieldName, fieldSchema, isOptional, logger, readonly: finalState === "readonly" || readonly };
  const render = getFormFieldRender(fieldSchema);

  if (!render || render === "section" || render === "field-list") {
    return;
  }

  const Component = componentRegistry[render];

  return <Component {...props} />;
}

// oxlint-disable-next-line max-lines-per-function
export function FormFieldFieldList({
  fieldName,
  fieldSchema,
  isOptional,
  logger,
  readonly = false,
}: FormFieldBaseProps) {
  const metadata = fieldSchema.meta() as AutoFormFieldsMetadata;
  const { maxItems, label, placeholder, nbItems, state } = metadata;
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  const isDisabled = state === "disabled" || readonly;
  const { value: elementSchema } = Result.unwrap(getElementSchema(fieldSchema));
  invariant(elementSchema !== undefined, "elementSchema should be defined");
  const fieldValue = useWatch({ name: fieldName });
  const formValues = useWatch({ disabled: nbItems === undefined });
  const length = typeLikeResolver(nbItems, formValues);
  const { setValue } = useFormContext();
  const items = useMemo(() => arrayAlign(fieldValue, length), [fieldValue, length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we don't want to re-run this effect when the items change already bind in the useMemo
  useEffect(() => {
    if (length !== undefined && fieldValue?.length !== length) {
      setValue(fieldName, items, { shouldValidate: false });
    }
  }, [length, fieldName, setValue]);
  const { addKey, keys, removeKey } = useStableKeys(useRef, items.length);
  /**
   * Function called when user wants to add a new form to the list
   * @param onChange callback to update the whole FormFieldFormList value
   */
  function addItem(onChange: (value: unknown) => void) {
    addKey();
    onChange([...(items || []), undefined]);
  }
  /**
   * Function called when user wants to delete a form from the list
   * @param onChange callback to update the whole FormFieldFormList value
   * @param indexToDelete index of the item to delete
   */
  function onDeleteItem(onChange: (value: unknown) => void, indexToDelete: number) {
    removeKey(indexToDelete);
    // oxlint-disable-next-line id-length
    const newItems = items.filter((_, index) => index !== indexToDelete);
    onChange(newItems);
  }

  return (
    <FormFieldBase {...props} showLabel={false}>
      {({ field }) => (
        <div className="flex w-full flex-col gap-4">
          {label && <Title>{label}</Title>}
          {placeholder && <Paragraph>{placeholder}</Paragraph>}
          {items.map((_item, index) => (
            <div className="flex gap-2" key={keys[index]}>
              <div className="flex-1">
                <AutoFormField
                  fieldName={`${fieldName}.${keys[index]}`}
                  fieldSchema={elementSchema}
                  logger={logger}
                  readonly={isDisabled}
                  state={state}
                />
              </div>
              {index === 0 && nbItems === undefined && (
                <Button
                  className={cn("mt-7.5", { hidden: isDisabled })}
                  disabled={items.length >= (maxItems ?? Infinity)}
                  name={`add-${fieldName}`}
                  onClick={() => addItem(field.onChange)}
                  type="button"
                  variant="ghost"
                >
                  <IconReject className="size-4 rotate-45" />
                </Button>
              )}
              {index !== 0 && nbItems === undefined && (
                <Button
                  className={cn("mt-7.5", { hidden: isDisabled })}
                  name={`delete-${fieldName}-${index}`}
                  onClick={() => onDeleteItem(field.onChange, index)}
                  type="button"
                  variant="ghost"
                >
                  <IconMinus className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </FormFieldBase>
  );
}
