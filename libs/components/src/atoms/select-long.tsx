// oxlint-disable no-duplicate-imports
// oxlint-disable max-lines-per-function
import { cn } from "@monorepo/utils";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { IconSearch } from "../icons/icon-search";
import { IconX } from "../icons/icon-x";
import { Button } from "./button";
import { Input } from "./input";
import type { Select as ShadcnSelect } from "./select";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "./select";

export type SelectLongProps<Option, Value = string> = ComponentProps<typeof ShadcnSelect> & {
  name: string;
  options: Array<Option>;
  getLabel: (option: Option) => string;
  getValue: (option: Option) => Value;
  placeholder?: string;
  onChange?: (value: Value | undefined, option: Option | undefined) => void;
  value?: Value;
  label?: string;
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const minValuesForFilter = 10;

const valueToString = (val: unknown): string | undefined => (val === undefined ? undefined : String(val));

export function SelectLong<Option, Value = string>(props: SelectLongProps<Option, Value>) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const selectedStringValue =
    props.value === null || props.value === undefined ? undefined : valueToString(props.value);

  const filterable = props.options.length > minValuesForFilter;

  // Hide, don't remove because of radix behaviours
  const isOptionVisible = (option: Option) =>
    !filterable || props.getLabel(option).toLowerCase().includes(search.toLowerCase());

  const handleSelectChange = (strValue: string) => {
    const selectedOption = props.options.find(opt => String(props.getValue(opt)) === strValue);
    if (selectedOption) {
      const optionValue = props.getValue(selectedOption);
      if (props.onChange) {
        props.onChange(optionValue, selectedOption);
      }
    }
    setSearch("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearch("");
    }
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (props.onChange) {
      // // oxlint-disable-next-line no-explicit-any
      props.onChange(undefined, undefined);
    }
    setSearch("");
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && filterable && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 1);
    }
  }, [isOpen, filterable]);

  const visibleCount = props.options.filter(isOptionVisible).length;

  return (
    <Select
      disabled={props.disabled}
      name={props.name}
      value={selectedStringValue}
      onValueChange={handleSelectChange}
      onOpenChange={handleOpenChange}
    >
      <div className={cn("relative", cn(props.fullWidth && "w-full"))}>
        <SelectTrigger
          name={props.name}
          className={cn(
            props.className,
            props.clearable && Boolean(selectedStringValue) && "gap-9",
            props.fullWidth && "w-full",
          )}
        >
          <SelectValue placeholder={props.placeholder || "Select an option"} />
        </SelectTrigger>
        {props.clearable && Boolean(selectedStringValue) && (
          <Button
            size="icon"
            name={`${props.name}-clear`}
            type="button"
            variant="ghost"
            className="absolute right-7 -translate-y-9"
            onClick={handleClear}
          >
            <IconX />
          </Button>
        )}
      </div>
      <SelectContent>
        {filterable && (
          <div>
            <div className="flex h-9 flex-row items-center gap-2 px-3">
              <IconSearch className="size-4 shrink-0 opacity-50" />
              <Input
                ref={inputRef}
                name={`search-${props.name}`}
                value={search}
                onKeyDown={el => el.stopPropagation()}
                onFocus={el => el.stopPropagation()}
                onChange={el => setSearch(el.target.value)}
                placeholder={props.label ? `Search ${props.label?.toLowerCase()}...` : "Search option..."}
                aria-label={props.label ? `Search ${props.label.toLowerCase()}` : "Search options"}
                className="h-9 w-full border-0 focus:border-transparent! focus:ring-0! focus:outline-none!"
              />
            </div>
            <SelectSeparator />
          </div>
        )}
        {visibleCount === 0 && filterable ? (
          <div className="p-3 text-sm text-muted-foreground">No options found.</div>
        ) : undefined}

        {props.options.map(option => {
          const label = props.getLabel(option);
          const value = String(props.getValue(option));
          return (
            <SelectItem key={value} value={value} hidden={!isOptionVisible(option)}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
