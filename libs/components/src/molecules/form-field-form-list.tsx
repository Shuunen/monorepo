import { cn, isEmpty } from "@monorepo/utils";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { z } from "zod";
import { Badge } from "../atoms/badge";
import { Button } from "../atoms/button";
import { Paragraph, Title } from "../atoms/typography";
import { IconAccept } from "../icons/icon-accept";
import { IconChevronRight } from "../icons/icon-chevron-right";
import { IconCircleClose } from "../icons/icon-circle-close";
import { IconReject } from "../icons/icon-reject";
import { IconTrash } from "../icons/icon-trash";
import { IconUpcoming } from "../icons/icon-upcoming";
import type { AutoFormFieldFormsMetadata } from "./auto-form.types";
import { field, mapExternalDataToFormFields, normalizeData } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import type { ItemProps } from "./form-field-form-list.utils";

function ItemBadge({ hasError, isEmpty }: { hasError: boolean; isEmpty: boolean }) {
  let icon = <IconCircleClose />;
  let label = "Incomplete";
  let variant: "destructive" | "success" | "outline" = "destructive";
  if (!hasError && isEmpty) {
    icon = <IconUpcoming />;
    label = "To complete";
    variant = "outline";
  } else if (!isEmpty) {
    icon = <IconAccept />;
    label = "Completed";
    variant = "success";
  }
  return (
    <Badge className="align-top" name="status" variant={variant}>
      {icon}
      {label}
    </Badge>
  );
}

function Item({
  item,
  index,
  identifier,
  isEmpty,
  icon,
  hasError,
  readonly,
  labels,
  onDeleteItem,
  onCompleteItem,
  field,
}: ItemProps) {
  return (
    <div
      className={cn(
        "flex min-w-md items-center gap-4 rounded-xl border border-gray-300 p-4 shadow transition-colors hover:bg-gray-50",
      )}
      data-testid={`${field.name}-${index}`}
    >
      {icon && <div className="rounded-xl bg-gray-100 p-2">{icon}</div>}
      <div className="flex flex-col gap-1">
        <ItemBadge hasError={hasError} isEmpty={isEmpty} />
        <Title className="whitespace-nowrap" level={3}>
          {identifier}
        </Title>
      </div>
      <Button
        className={cn("ml-auto", { hidden: readonly })}
        name="delete"
        onClick={() => onDeleteItem(field.onChange, index)}
        type="button"
        variant="outline"
      >
        <IconTrash />
      </Button>
      <Button
        className={cn({ hidden: readonly })}
        name="complete"
        onClick={() => onCompleteItem(field.onChange, index, item)}
        type="button"
        variant="outline"
      >
        {labels?.completeButton ?? "Complete"}
        <IconChevronRight className="size-5" />
      </Button>
    </div>
  );
}

// oxlint-disable-next-line max-lines-per-function
export function FormFieldFormList({
  fieldName,
  stepState,
  fieldSchema,
  isOptional,
  logger,
  readonly = false,
  showForm,
}: FormFieldBaseProps) {
  const metadata = fieldSchema.meta() as AutoFormFieldFormsMetadata;
  const { label, maxItems, icon, identifier, labels } = metadata;
  const fieldState = "state" in metadata ? metadata.state : undefined;
  const state = fieldState ?? stepState ?? "editable";
  const props = { fieldName, fieldSchema, isOptional, logger, readonly: state === "readonly" || readonly };
  const { setValue, getValues } = useFormContext();
  const fieldValue = useWatch({ name: fieldName });
  const items = (fieldValue as Array<Record<string, unknown>>) || [];
  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this once on mount
  useEffect(() => {
    const currentValue = getValues(fieldName);
    if (currentValue !== undefined) {
      return;
    }
    logger?.debug("initializing form list field value to empty array");
    setValue(fieldName, []);
  }, []);
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
  function onCompleteItem(
    onChange: (value: unknown) => void,
    indexToComplete: number,
    itemData: Record<string, unknown>,
  ) {
    const schema = (fieldSchema as z.ZodArray<z.ZodObject>).element;
    const onSubmit = (data: Record<string, unknown>) => {
      const mappedData = mapExternalDataToFormFields(schema, data);
      logger?.info("data from subform", { data, mappedData });
      const newItems = items.map((item, index) => (index === indexToComplete ? mappedData : item));
      onChange(newItems);
    };
    showForm?.({
      initialData: normalizeData([schema], itemData),
      onSubmit,
      querySelectorForScroll: `[data-testid='${field.name}-${indexToComplete}']`,
      schema,
    });
  }

  return (
    <FormFieldBase {...props} showLabel={false}>
      {({ field, fieldState, formState }) => {
        const hasError = Boolean(fieldState.error && formState.isSubmitted);
        return (
          <div className="flex flex-col gap-4">
            {label && <Title>{label}</Title>}
            {metadata.placeholder && <Paragraph>{metadata.placeholder}</Paragraph>}
            {items.map((item, index) => {
              const isEmptyItem = isEmpty(item);
              const itemIdentifier = identifier && !isEmptyItem ? identifier(item) : `Form ${index + 1}`;
              logger?.info({ fieldState, hasError });
              return (
                <Item
                  field={field}
                  hasError={hasError}
                  icon={icon}
                  identifier={itemIdentifier}
                  index={index}
                  isEmpty={isEmptyItem}
                  item={item}
                  key={itemIdentifier}
                  labels={labels}
                  onCompleteItem={onCompleteItem}
                  onDeleteItem={onDeleteItem}
                  readonly={readonly}
                />
              );
            })}
            <div className="flex flex-col items-start gap-4">
              <Button
                className={cn({ hidden: readonly })}
                disabled={maxItems !== undefined && items.length >= maxItems}
                name="add"
                onClick={() => addItem(field.onChange)}
                type="button"
                variant="secondary"
              >
                {labels?.addButton ?? "Add item"}
                <IconReject className="size-5 rotate-45" />
              </Button>
              {/* we check isArray(fieldState.error) to know if the error is specifically about missing forms */}
              {hasError && Array.isArray(fieldState.error) && (
                <span className="text-sm text-destructive">Please complete all forms before submitting.</span>
              )}
            </div>
          </div>
        );
      }}
    </FormFieldBase>
  );
}
