import { cn } from "@monorepo/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import { FormControl } from "../atoms/form";
import { Popover, PopoverContent, PopoverTrigger } from "../atoms/popover";
import { IconCheck } from "../icons/icon-check";
import { IconChevronDown } from "../icons/icon-chevron-down";
import type { SelectOption } from "./auto-form.types";
import { getFieldMetadataOrThrow, getZodEnumOptions } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { Button } from "../atoms/button";

const itemHeight = 32;
const maxHeight = 256;

function VirtualizedOptions({
  fieldName,
  fieldValue,
  onSelect,
  options,
}: {
  fieldName: string;
  fieldValue: string;
  onSelect: (value: string) => void;
  options: SelectOption[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: options.length,
    estimateSize: () => itemHeight,
    getScrollElement: () => scrollRef.current,
    overscan: 5,
  });
  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto p-1"
      data-testid={`select-options-${fieldName}`}
      role="listbox"
      style={{ maxHeight }}
    >
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => {
          const option = options[virtualItem.index];
          const isSelected = fieldValue === option.value;
          return (
            <div
              aria-selected={isSelected}
              className={cn(
                "absolute top-0 left-0 flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none hover:bg-accent hover:text-accent-foreground",
                isSelected && "bg-accent text-accent-foreground",
              )}
              key={option.value}
              onClick={() => onSelect(option.value)}
              onKeyDown={event => event.key === "Enter" && onSelect(option.value)}
              role="option"
              style={{ height: virtualItem.size, transform: `translateY(${virtualItem.start}px)` }}
              tabIndex={0}
            >
              {option.label}
              <span
                className={cn("absolute right-2 flex size-3.5 items-center justify-center", !isSelected && "hidden")}
              >
                <IconCheck className="size-4" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FormFieldSelect({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const [open, setOpen] = useState(false);
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { label = "", placeholder, state = "editable" } = metadata;
  const isDisabled = state === "disabled" || readonly;
  const options = getZodEnumOptions(fieldSchema);
  if (!options.ok) {
    throw new Error(`Field "${fieldName}" is not an enum`);
  }
  const placeholderText = placeholder ?? `Select ${label}`;

  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => {
        const selectedOption = options.value?.find(opt => opt.value === field.value);
        return (
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button aria-expanded={open} disabled={isDisabled} name={field.name} variant="outline">
                  <span className={cn("line-clamp-1", !selectedOption && "text-muted-foreground")}>
                    {selectedOption?.label ?? placeholderText}
                  </span>
                  <IconChevronDown className="size-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="max-w-md p-0">
                <VirtualizedOptions
                  fieldName={fieldName}
                  fieldValue={field.value}
                  onSelect={value => {
                    field.onChange(value);
                    setOpen(false);
                  }}
                  options={options.value ?? []}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
        );
      }}
    </FormFieldBase>
  );
}
