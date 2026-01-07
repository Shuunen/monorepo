import { Button } from "../atoms/button";
import { Title } from "../atoms/typography";
import { IconChevronRight } from "../icons/icon-chevron-right";
import { IconHourglass } from "../icons/icon-hourglass";
import { IconReject } from "../icons/icon-reject";
import { IconTrash } from "../icons/icon-trash";
import { getFieldMetadataOrThrow } from "./auto-form.utils";
import { DebugData } from "./debug-data";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

export function FormFieldFormList({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { label } = metadata;
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
          {items.map((_item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: its ok here for form lists
            <div className="flex gap-4 items-center border p-4 rounded-xl" key={`form-list-item-${index}`}>
              <IconHourglass className="size-6" />
              {/* To be implemented : use the identifier from the subStep here or fall back to 0{index + 1} */}
              <div>Applicant - 0{index + 1}</div>
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
            <Button name="add" onClick={() => addItem(field.onChange)} variant="secondary">
              Add Applicant
              <IconReject className="size-5 rotate-45" />
            </Button>
          </div>
          <DebugData data={formData[field.name]} title="formData" />
        </div>
      )}
    </FormFieldBase>
  );
}
