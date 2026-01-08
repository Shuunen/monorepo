import { isEmpty } from "@monorepo/utils";
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

export function FormFieldFormList({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
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
  return (
    <FormFieldBase {...props} showLabel={false}>
      {field => (
        <div className="flex flex-col gap-4 mt-2">
          <Title>{label}</Title>
          {items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: its ok here for form lists
            <div className="flex gap-4 items-center border border-gray-300 shadow p-4 rounded-xl" key={`form-list-item-${index}`}>
              <div className="bg-gray-100 p-2 rounded-xl">
                <IconHourglass className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <Badge name="status" variant={isEmpty(item) ? "secondary" : "success"}>
                  {isEmpty(item) ? "To complete" : "Validated"}
                </Badge>
                <Title level={3}>{identifier && !isEmpty(item) ? identifier(item) : `Form ${index + 1}`}</Title>
              </div>
              <Button className="ml-auto" name="delete" onClick={() => onDeleteItem(field.onChange, index)} variant="outline">
                <IconTrash />
              </Button>
              <Button name="complete" variant="outline">
                Complete
                <IconChevronRight className="size-5" />
              </Button>
            </div>
          ))}
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
