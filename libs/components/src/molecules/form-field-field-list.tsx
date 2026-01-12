import { z } from "zod";
import { Button } from "../atoms/button";
import { Paragraph, Title } from "../atoms/typography";
import { IconMinus } from "../icons/icon-minus";
import { IconReject } from "../icons/icon-reject";
import type { AutoFormFieldsMetadata } from "./auto-form.types";
import { getFieldMetadata, getFormFieldRender } from "./auto-form.utils";
import { type AutoFormFieldProps, componentRegistry } from "./auto-form-field.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

function AutoFormField({ fieldName, fieldSchema, formData, stepState, logger }: AutoFormFieldProps) {
  const isOptional = fieldSchema instanceof z.ZodOptional;
  const metadata = getFieldMetadata(fieldSchema) ?? {};
  const fieldState = "state" in metadata ? metadata.state : undefined;
  const state = fieldState ?? stepState ?? "editable";
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly: state === "readonly" };
  const render = getFormFieldRender(fieldSchema);

  if (!render || render === "section" || render === "field-list") {
    return;
  }

  const Component = componentRegistry[render];

  return <Component {...props} />;
}

export function FormFieldFieldList({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = fieldSchema.meta() as AutoFormFieldsMetadata;
  const { maxItems, label, placeholder } = metadata;
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly };

  const itemSchema = (fieldSchema as z.ZodArray<z.ZodObject>).element;
  const items = (formData[fieldName] as unknown[]) || [undefined];
  /**
   * Function called when user wants to add a new form to the list
   * @param onChange callback to update the whole FormFieldFormList value
   */
  function addItem(onChange: (value: unknown) => void) {
    onChange([...(items || []), undefined]);
  }
  /**
   * Function called when user wants to delete a form from the list
   * @param onChange callback to update the whole FormFieldFormList value
   * @param indexToDelete index of the item to delete
   */
  function onDeleteItem(onChange: (value: unknown) => void, indexToDelete: number) {
    // oxlint-disable-next-line id-length
    const newItems = items.filter((_, index) => index !== indexToDelete);
    onChange(newItems);
  }

  return (
    <FormFieldBase {...props} showLabel={false}>
      {({ field }) => (
        <div className="flex flex-col gap-4 mt-2">
          <Title>{label}</Title>
          <Paragraph>{placeholder}</Paragraph>
          {items.map((_item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: we need the index to be the key
            <div className="flex gap-2" key={index}>
              <div className="flex-1">
                <AutoFormField fieldName={`${fieldName}.${index}`} fieldSchema={itemSchema} formData={formData} logger={logger} />
              </div>
              {index === 0 && (
                <Button className="mt-7.5" disabled={items.length >= (maxItems ?? Infinity)} name={`add-${fieldName}`} onClick={() => addItem(field.onChange)} type="button" variant="ghost">
                  <IconReject className="size-4 rotate-45" />
                </Button>
              )}
              {index !== 0 && (
                <Button className="mt-7.5" name={`delete-${fieldName}-${index}`} onClick={() => onDeleteItem(field.onChange, index)} type="button" variant="ghost">
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
