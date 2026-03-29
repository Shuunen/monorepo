import { cn, functionReturningVoid } from "@monorepo/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { invariant, isFunction } from "es-toolkit";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { Button } from "../atoms/button";
import { FormControl } from "../atoms/form";
import { Popover, PopoverContent, PopoverTrigger } from "../atoms/popover";
import { IconCheck } from "../icons/icon-check";
import { IconChevronDown } from "../icons/icon-chevron-down";
import { useAutoFormParentData } from "./auto-form-parent-data";
import type { AutoFormFieldSelectMetadata, SelectOption } from "./auto-form.types";
import { getFieldMetadataOrThrow, typeLikeResolver } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";

const itemHeight = 32;
const maxHeight = 256;

// oxlint-disable-next-line max-lines-per-function
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return functionReturningVoid;
    }
    function stopScrollPropagation(event: Event) {
      event.stopPropagation();
    }
    el.addEventListener("wheel", stopScrollPropagation, { passive: true });
    el.addEventListener("touchmove", stopScrollPropagation, { passive: true });
    return () => {
      el.removeEventListener("wheel", stopScrollPropagation);
      el.removeEventListener("touchmove", stopScrollPropagation);
    };
  }, []);

  const virtualizer = useVirtualizer({
    count: options.length,
    estimateSize: () => itemHeight,
    getScrollElement: () => scrollRef.current,
    measureElement: element => element.getBoundingClientRect().height,
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
          invariant(option, `Option at index ${virtualItem.index} not found`);
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
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              style={{ minHeight: virtualItem.size, transform: `translateY(${virtualItem.start}px)` }}
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

// oxlint-disable-next-line react/no-multi-comp
export function FormFieldSelect({ fieldName, fieldSchema, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const [open, setOpen] = useState(false);
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema) as AutoFormFieldSelectMetadata;
  const { label = "", options, placeholder, state = "editable" } = metadata;
  const formData = useWatch({ disabled: !isFunction(options) });
  const parentData = useAutoFormParentData();
  const resolvedOptions = typeLikeResolver(options, formData, parentData);
  if (!Array.isArray(resolvedOptions)) {
    throw new TypeError(`Field "${fieldName}" requires "options" in metadata (array or function returning array)`);
  }
  const isDisabled = state === "disabled" || readonly;
  const placeholderText = placeholder ?? `Select ${label}`;

  const props = { fieldName, fieldSchema, isOptional, logger, readonly };
  return (
    <FormFieldBase {...props}>
      {({ field }) => {
        const selectedOption = resolvedOptions.find(opt => opt.value === field.value);
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
                  options={resolvedOptions}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
        );
      }}
    </FormFieldBase>
  );
}
