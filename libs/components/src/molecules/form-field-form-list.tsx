import { isEmpty } from "@monorepo/utils";
import type { z } from "zod";
import { Badge } from "../atoms/badge";
import { Button } from "../atoms/button";
import { Title } from "../atoms/typography";
import { IconChevronRight } from "../icons/icon-chevron-right";
import { IconHourglass } from "../icons/icon-hourglass";
import { IconReject } from "../icons/icon-reject";
import { IconTrash } from "../icons/icon-trash";
import type { AutoFormFieldFormsMetadata } from "./auto-form.types";
import { DebugData } from "./debug-data";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

// oxlint-disable-next-line max-lines-per-function
export function FormFieldFormList({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false, showForm }: FormFieldBaseProps) {
  const metadata = fieldSchema.meta() as AutoFormFieldFormsMetadata;
  const { label, maxItems, identifier } = metadata;
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly };
  const items = formData[fieldName] as Array<Record<string, unknown>>;

  function addItem(onChange: (value: unknown) => void) {
    onChange([...(items || []), {}]);
  }

  function onDeleteItem(onChange: (value: unknown) => void, indexToDelete: number) {
    // oxlint-disable-next-line id-length
    const newItems = items.filter((_, index) => index !== indexToDelete);
    onChange(newItems);
  }

  /**
   * Function called when user wants to complete a single form list item
   * @param onChange callback to update the whole FormFieldFormList value
   * @param itemData data of the item to complete
   * @param indexToComplete index of the item to complete
   */
  function onCompleteItem(onChange: (value: unknown) => void, indexToComplete: number, itemData: Record<string, unknown>) {
    logger?.showInfo(`Completing item at index ${indexToComplete}`);
    const formSchema = (fieldSchema as z.ZodArray<z.ZodType>).element;
    logger?.info({ fieldSchema, formSchema });
    showForm?.({
      initialData: itemData,
      onSubmit: data => {
        const newItems = items.map((item, index) => (index === indexToComplete ? data : item));
        onChange(newItems);
      },
      schema: formSchema as z.ZodObject,
    });
  }

  return (
    <FormFieldBase {...props} showLabel={false}>
      {field => (
        <div className="flex flex-col gap-4 mt-2">
          <Title>{label}</Title>
          {items.map((item, index) => {
            const isEmptyItem = isEmpty(item);
            const itemIdentifier = identifier && !isEmptyItem ? identifier(item) : `Form ${index + 1}`;
            return (
              <div className="flex gap-4 items-center border border-gray-300 shadow p-4 rounded-xl hover:bg-gray-50 transition-colors" key={itemIdentifier}>
                <div className="bg-gray-100 p-2 rounded-xl">
                  <IconHourglass className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <Badge name="status" variant={isEmptyItem ? "secondary" : "success"}>
                    {isEmptyItem ? "To complete" : "Validated"}
                  </Badge>
                  <Title level={3}>{itemIdentifier}</Title>
                </div>
                <Button className="ml-auto" name="delete" onClick={() => onDeleteItem(field.onChange, index)} variant="outline">
                  <IconTrash />
                </Button>
                <Button name="complete" onClick={() => onCompleteItem(field.onChange, index, item)} variant="outline">
                  Complete
                  <IconChevronRight className="size-5" />
                </Button>
              </div>
            );
          })}
          <div className="flex">
            <Button disabled={maxItems !== undefined && items.length >= maxItems} name="add" onClick={() => addItem(field.onChange)} variant="secondary">
              Add Applicant
              <IconReject className="size-5 rotate-45" />
            </Button>
          </div>
          <DebugData data={formData[field.name]} title="formData" />
          <DebugData data={metadata} title="metadata" />
        </div>
      )}
    </FormFieldBase>
  );
}
