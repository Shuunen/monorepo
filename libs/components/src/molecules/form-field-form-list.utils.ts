import type { ControllerRenderProps } from "react-hook-form";

export type ItemProps = {
  item: Record<string, unknown>;
  index: number;
  identifier: string;
  icon: React.ReactNode;
  isEmpty: boolean;
  hasError: boolean;
  readonly: boolean;
  labels?: { completeButton?: string };
  onDeleteItem: (onChange: (value: unknown) => void, indexToDelete: number) => void;
  onCompleteItem: (onChange: (value: unknown) => void, indexToComplete: number, itemData: Record<string, unknown>) => void;
  field: ControllerRenderProps;
};
