import type { ControllerRenderProps } from "react-hook-form";
import type { AutoFormFormsMetadata } from "./auto-form.types";

export type OnCompleteItemParams = {
  onChange: (value: unknown) => void;
  indexToComplete: number;
  itemData: Record<string, unknown>;
  dataTestId: string;
};

export type ItemProps = {
  field: ControllerRenderProps;
  hasError: boolean;
  icon?: AutoFormFormsMetadata["icon"];
  identifier: string;
  index: number;
  isEmpty: boolean;
  item: Record<string, unknown>;
  labels?: AutoFormFormsMetadata["labels"];
  onCompleteItem: (params: OnCompleteItemParams) => void;
  onDeleteItem: (onChange: (value: unknown) => void, indexToDelete: number) => void;
  readonly: boolean;
  showDelete: boolean;
};
