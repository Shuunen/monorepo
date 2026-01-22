import type { ControllerRenderProps } from "react-hook-form";
import type { AutoFormFieldFormsMetadata } from "./auto-form.types";

export type ItemProps = {
  item: Record<string, unknown>;
  index: number;
  identifier: string;
  icon?: AutoFormFieldFormsMetadata["icon"];
  isEmpty: boolean;
  hasError: boolean;
  readonly: boolean;
  labels?: AutoFormFieldFormsMetadata["labels"];
  onDeleteItem: (onChange: (value: unknown) => void, indexToDelete: number) => void;
  onCompleteItem: (onChange: (value: unknown) => void, indexToComplete: number, itemData: Record<string, unknown>) => void;
  field: ControllerRenderProps;
};
