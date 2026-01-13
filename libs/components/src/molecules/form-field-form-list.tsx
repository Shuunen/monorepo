import { cn, isEmpty } from "@monorepo/utils";
import type { z } from "zod";
import { Badge } from "../atoms/badge";
import { Button } from "../atoms/button";
import { Paragraph, Title } from "../atoms/typography";
import { IconChevronRight } from "../icons/icon-chevron-right";
import { IconReject } from "../icons/icon-reject";
import { IconTrash } from "../icons/icon-trash";
import type { AutoFormFieldFormsMetadata } from "./auto-form.types";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

// oxlint-disable-next-line max-lines-per-function
export function FormFieldFormList({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false, showForm }: FormFieldBaseProps) {
  const metadata = fieldSchema.meta() as AutoFormFieldFormsMetadata;
  const { label, maxItems, icon, identifier, labels } = metadata;
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly };
  const items = (formData[fieldName] as Array<Record<string, unknown>>) || [];
  /**
   * Function called when user wants to add a new form to the list
   * @param onChange callback to update the whole FormFieldFormList value
   */
  function addItem(onChange: (value: unknown) => void) {
    onChange([...(items || []), {}]);
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
  /**
   * Function called when user wants to complete a form from the list
   * @param onChange callback to update the whole FormFieldFormList value
   * @param itemData data of the item to complete
   * @param indexToComplete index of the item to complete
   */
  function onCompleteItem(onChange: (value: unknown) => void, indexToComplete: number, itemData: Record<string, unknown>) {
    const schema = (fieldSchema as z.ZodArray<z.ZodObject>).element;
    const onSubmit = (data: Record<string, unknown>) => {
      const newItems = items.map((item, index) => (index === indexToComplete ? data : item));
      onChange(newItems);
    };
    showForm?.({ initialData: itemData, onSubmit, schema });
  }

  return (
    <FormFieldBase {...props} showLabel={false}>
      {({ field, fieldState, formState }) => {
        const hasError = fieldState.error && formState.isSubmitted;
        return (
          <div className="flex flex-col gap-4 mt-2">
            <Title>{label}</Title>
            <Paragraph>{metadata.placeholder}</Paragraph>
            {items.map((item, index) => {
              const isEmptyItem = isEmpty(item);
              const itemIdentifier = identifier && !isEmptyItem ? identifier(item) : `Form ${index + 1}`;
              return (
                <div className={cn("flex min-w-md gap-4 items-center border border-gray-300 shadow p-4 rounded-xl hover:bg-gray-50 transition-colors", { "bg-red-50 border-red-200 hover:bg-red-50 hover:border-red-300": hasError && isEmptyItem })} key={itemIdentifier}>
                  <div className="bg-gray-100 p-2 rounded-xl">{icon}</div>
                  <div className="flex flex-col gap-1">
                    <Badge name="status" variant={isEmptyItem ? "secondary" : "success"}>
                      {isEmptyItem ? "To complete" : "Validated"}
                    </Badge>
                    <Title className="whitespace-nowrap" level={3}>
                      {itemIdentifier}
                    </Title>
                  </div>
                  <Button className="ml-auto" name="delete" onClick={() => onDeleteItem(field.onChange, index)} type="button" variant="outline">
                    <IconTrash />
                  </Button>
                  <Button name="complete" onClick={() => onCompleteItem(field.onChange, index, item)} type="button" variant="outline">
                    {labels?.completeButton ?? "Complete"}
                    <IconChevronRight className="size-5" />
                  </Button>
                </div>
              );
            })}
            <div className="flex flex-col items-start gap-4">
              <Button disabled={maxItems !== undefined && items.length >= maxItems} name="add" onClick={() => addItem(field.onChange)} type="button" variant="secondary">
                {labels?.addButton ?? "Add item"}
                <IconReject className="size-5 rotate-45" />
              </Button>
              {/* we check isArray(fieldState.error) to know if the error is specifically about missing forms */}
              {hasError && Array.isArray(fieldState.error) && <span className="text-destructive text-sm">Please complete all forms before submitting.</span>}
            </div>
          </div>
        );
      }}
    </FormFieldBase>
  );
}
