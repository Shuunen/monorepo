import { cn, isEmpty, nbThird, Result, useStableKeys } from "@monorepo/utils";
import { invariant } from "es-toolkit";
import { useWatch } from "react-hook-form";
import { Badge } from "../atoms/badge";
import { Button } from "../atoms/button";
import { Paragraph, Title } from "../atoms/typography";
import { IconAccept } from "../icons/icon-accept";
import { IconChevronRight } from "../icons/icon-chevron-right";
import { IconCircleClose } from "../icons/icon-circle-close";
import { IconReject } from "../icons/icon-reject";
import { IconTrash } from "../icons/icon-trash";
import { IconUpcoming } from "../icons/icon-upcoming";
import type { AutoFormFormsMetadata } from "./auto-form.types";
import {
  getElementSchema,
  isSubformFilled,
  isZodObject,
  mapExternalDataToFormFields,
  normalizeData,
} from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import type { ItemProps, OnCompleteItemParams } from "./form-field-form-list.utils";
import { useRef } from "react";

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
    label = "Validated";
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
  showDelete,
}: ItemProps) {
  const dataTestId = `${field.name}-${index}`;
  return (
    <div
      className={cn(
        "flex min-w-md items-center gap-4 rounded-xl border border-gray-300 p-4 shadow transition-colors hover:bg-gray-50",
      )}
      data-testid={dataTestId}
    >
      {icon && <div className="rounded-xl bg-gray-100 p-2">{typeof icon === "function" ? icon({}) : icon}</div>}
      <div className="flex flex-col gap-1">
        <ItemBadge hasError={hasError} isEmpty={isEmpty} />
        <Title className="whitespace-nowrap" level={3}>
          {identifier}
        </Title>
      </div>
      <Button
        className={cn("ml-auto", { hidden: !showDelete })}
        name="delete"
        onClick={() => onDeleteItem(field.onChange, index)}
        type="button"
        variant="outline"
      >
        <IconTrash />
      </Button>
      <Button
        className={cn({ hidden: readonly, "ml-auto": !showDelete })}
        name="complete"
        onClick={() => onCompleteItem({ dataTestId, indexToComplete: index, itemData: item, onChange: field.onChange })}
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
  const metadata = fieldSchema.meta() as AutoFormFormsMetadata;
  const { label, maxItems, icon, identifier, labels } = metadata;
  const fieldState = "state" in metadata ? metadata.state : undefined;
  const state = fieldState ?? stepState ?? "editable";
  const props = { fieldName, fieldSchema, isOptional, logger, readonly: state === "readonly" || readonly };
  const fieldValue = useWatch({ name: fieldName });
  const items = (fieldValue as Array<Record<string, unknown>>) || [];
  const showAddButton = !(readonly || maxItems === 1);
  const { addKey, keys, removeKey } = useStableKeys(useRef, items.length);
  /**
   * Function called when user wants to add a new form to the list
   * @param onChange callback to update the whole FormFieldFormList value
   */
  function addItem(onChange: (value: unknown) => void) {
    addKey();
    onChange([...(items || []), {}]);
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
  /**
   * Function called when user wants to complete a form from the list
   * @param params object params for onCompleteItem
   * @param params.onChange callback to update the whole FormFieldFormList value
   * @param params.itemData data of the item to complete
   * @param params.indexToComplete index of the item to complete
   * @param params.dataTestId the target dataTestId
   */
  function onCompleteItem({ onChange, indexToComplete, itemData, dataTestId }: OnCompleteItemParams) {
    const { value: elementSchema } = Result.unwrap(getElementSchema(fieldSchema));
    invariant(elementSchema !== undefined, "elementSchema should be defined");
    invariant(isZodObject(elementSchema), "elementSchema should be a zod object");
    const onSubmit = (data: Record<string, unknown>) => {
      const mappedData = mapExternalDataToFormFields(elementSchema, data);
      logger?.info("data from subform", { data, mappedData });
      const newItems = items.map((item, index) => (index === indexToComplete ? mappedData : item));
      onChange(newItems);
    };
    showForm?.({
      initialData: normalizeData([elementSchema], itemData),
      onSubmit,
      querySelectorForScroll: `[data-testid='${dataTestId}']`,
      schema: elementSchema,
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
              const data = isEmpty(item) ? undefined : item;
              const readableIndex = String(index + 1).padStart(nbThird, "0");
              const itemIdentifier = identifier
                ? identifier({ ...data, index: readableIndex })
                : `Form ${readableIndex}`;
              logger?.info(`SubForm "${itemIdentifier}" field name "${field.name}"`, { fieldState, hasError });
              return (
                <Item
                  field={field}
                  hasError={hasError}
                  icon={icon}
                  identifier={itemIdentifier}
                  index={index}
                  isEmpty={!isSubformFilled(item)}
                  item={item}
                  key={keys[index]}
                  labels={labels}
                  onCompleteItem={onCompleteItem}
                  onDeleteItem={onDeleteItem}
                  readonly={readonly}
                  showDelete={showAddButton}
                />
              );
            })}
            <div className="flex flex-col items-start gap-4">
              <Button
                className={cn({ hidden: !showAddButton })}
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
