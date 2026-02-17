// oxlint-disable no-magic-numbers, max-lines-per-function, complexity
import { dateIsoToReadableDatetime } from "@monorepo/utils";
import { addDays } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { IMaskInput } from "react-imask";
import { Button } from "../atoms/button";
import { Calendar } from "../atoms/calendar";
import { Card, CardContent } from "../atoms/card";
import { type NameProp, testIdFromProps } from "../atoms/form.utils";
import { InputGroup, InputGroupAddon, InputGroupButton } from "../atoms/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../atoms/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../atoms/select";
import { Separator } from "../atoms/separator";
import { IconCalendar } from "../icons/icon-calendar";
import { IconX } from "../icons/icon-x";
import { cn } from "../shadcn/utils";
import {
  calendarDateToUtc,
  computeDateChangeValue,
  computeTimeChangeValue,
  formatTime,
  isDateInputAtEnd,
  isDigitKey,
  parseInput,
  parseTimeInput,
  shouldShowClearButton,
} from "./datetime-picker.utils";

type DatetimePickerProps = {
  mode?: "date" | "date-time" | "time";
  readonly?: boolean;
  clearable?: boolean;
  className?: string;
  defaultValue?: Date;
  /** When true and mode is "date", sets the time to noon UTC (12:00) instead of midnight (00:00). Useful to avoid date shifting due to timezone offsets. */
  defaultToNoon?: boolean;
  onChange?: (date: Date | undefined) => void;
} & NameProp;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: datetime picker handles multiple modes (date, date-time, time)
export function DatetimePicker({
  mode = "date-time",
  readonly = false,
  clearable = true,
  className = "",
  defaultValue,
  defaultToNoon = false,
  onChange,
  ...props
}: DatetimePickerProps) {
  const time = mode !== "date";
  const showDate = mode !== "time";
  const noonHour = defaultToNoon ? 12 : 0; // oxlint-disable-line no-magic-numbers
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(defaultValue);
  const [month, setMonth] = useState<Date | undefined>(defaultValue ?? date);
  const [dateValue, setDateValue] = useState(dateIsoToReadableDatetime(defaultValue, false));
  const [timeValue, setTimeValue] = useState(defaultValue ? formatTime(defaultValue) : "");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  // Sync internal state when defaultValue appears after initial mount (e.g., from prefault schema defaults)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally syncing only when defaultValue timestamp changes
  useEffect(() => {
    if (defaultValue && !date) {
      setDate(defaultValue);
      setDateValue(dateIsoToReadableDatetime(defaultValue, false));
      setMonth(defaultValue);
    }
  }, [defaultValue?.getTime()]);

  const handleMaskedDateChange = (maskedValue: string) => {
    setDateValue(maskedValue);
    const parsedDate = parseInput(maskedValue);
    setDate(parsedDate ? new Date(parsedDate) : undefined);
    setMonth(parsedDate ? new Date(parsedDate) : undefined);
    onChange?.(computeDateChangeValue({ noonHour, parsedDate, time, timeValue }));
  };

  const handleMaskedTimeChange = (maskedValue: string) => {
    setTimeValue(maskedValue);
    if (!time) {
      return;
    }
    onChange?.(computeTimeChangeValue(maskedValue, date, showDate));
  };

  function handleClear() {
    setDate(undefined);
    setDateValue("");
    setTimeValue("");
    setMonth(undefined);
    onChange?.(undefined);
  }

  // oxlint-disable-next-line max-statements
  function handlePresetClick(presetValue: number) {
    if (presetValue === -1) {
      handleClear();
      setOpen(false);
      return;
    }
    const newDate = addDays(new Date(), presetValue);
    if (time && presetValue === 0) {
      const now = new Date();
      setDate(now);
      setDateValue(dateIsoToReadableDatetime(now, false));
      setMonth(now);
      setTimeValue(formatTime(now));
      onChange?.(now);
    } else {
      if (time) {
        const timeData = parseTimeInput(timeValue);
        if (timeData) {
          newDate.setHours(timeData.hours);
          newDate.setMinutes(timeData.minutes);
        }
      }
      setDate(newDate);
      setDateValue(dateIsoToReadableDatetime(newDate, false));
      setMonth(newDate);
      onChange?.(newDate);
    }
    setOpen(false);
  }

  return (
    <InputGroup
      className={cn(className, !time && showDate && "min-w-48", !showDate && "min-w-32")}
      name="datetime-picker"
    >
      {showDate && (
        <IMaskInput
          data-testid={testIdFromProps("input-date", props)}
          className={cn(
            "min-w-0 flex-2 px-3 py-1 text-base outline-0",
            (dateValue === "" || readonly) && "text-muted-foreground",
          )}
          mask="00/00/0000"
          value={dateValue}
          placeholder="DD/MM/YYYY"
          unmask={false}
          inputRef={dateInputRef}
          disabled={readonly}
          onAccept={handleMaskedDateChange}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
            if (time) {
              const target = event.target as HTMLInputElement;
              if (isDigitKey(event.key) && isDateInputAtEnd(target.selectionStart, target.value.length)) {
                event.preventDefault();
                timeInputRef.current?.focus();
              }
            }
          }}
        />
      )}
      {time && showDate && <Separator orientation="vertical" className="h-1/2!" />}
      {time && (
        <IMaskInput
          data-testid={testIdFromProps("input-date-time-picker", props)}
          inputRef={timeInputRef}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (showDate && event.key === "Backspace" && (timeValue === "--:--" || timeValue === "")) {
              event.preventDefault();
              const dateInput = dateInputRef.current;
              if (dateInput) {
                dateInput.focus();
                dateInput.setSelectionRange(dateInput.value.length, dateInput.value.length);
              }
            }
          }}
          className={cn(
            "min-w-0 flex-1 px-3 py-1 text-base outline-0",
            (timeValue === "" || timeValue === "--:--" || readonly) && "text-muted-foreground",
          )}
          id={`time-input-${props.name}`}
          mask="00:00"
          value={timeValue}
          placeholder="--:--"
          unmask={false}
          disabled={readonly}
          onAccept={handleMaskedTimeChange}
          overwrite
        />
      )}
      <InputGroupAddon align="inline-end">
        {clearable && shouldShowClearButton(dateValue, timeValue) && (
          <InputGroupButton
            name={`input-date-clear-${props.name}`}
            variant="ghost"
            size="icon-xs"
            aria-label={showDate ? "Clear date" : "Clear time"}
            disabled={readonly}
            onClick={handleClear}
          >
            <IconX />
            <span className="sr-only">{showDate ? "Clear date" : "Clear time"}</span>
          </InputGroupButton>
        )}
        {showDate && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                name={`input-date-${props.name}`}
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
                disabled={readonly}
              >
                <IconCalendar />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden border-0 p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Card
                className="max-w-75 gap-0 border border-input py-4"
                onClick={(event: { stopPropagation: () => void }) => event.stopPropagation()}
              >
                <CardContent className="mb-2 px-4">
                  <Calendar
                    name="input-date"
                    required={false}
                    mode="single"
                    selected={date}
                    month={month}
                    captionLayout="dropdown"
                    onMonthChange={setMonth}
                    onSelect={calendarDate => {
                      // Fix: always store/date as UTC so display matches local pick
                      const newDate = calendarDateToUtc({ calendarDate, time, timeValue });
                      setDate(newDate);
                      setDateValue(dateIsoToReadableDatetime(newDate, false));
                      setMonth(newDate);
                      onChange?.(newDate);
                      setOpen(false);
                    }}
                  />
                </CardContent>
                {time && (
                  <div className="relative flex gap-2 border-t border-input px-4 py-4">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-2 text-sm">
                      Time selection
                    </span>
                    <Select
                      name="input-date-time-hour"
                      value={timeValue.split(":")[0] || ""}
                      onValueChange={value => {
                        const currentMinutes = timeValue.split(":")[1] || "00";
                        const newTimeValue = `${value.padStart(2, "0")}:${currentMinutes}`;
                        handleMaskedTimeChange(newTimeValue);
                      }}
                    >
                      <SelectTrigger className="w-full" name="input-date-time-hour">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_elem, index) => {
                          const hour = String(index).padStart(2, "0");
                          return (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Select
                      name="input-date-time-minute"
                      value={timeValue.split(":")[1] || ""}
                      onValueChange={value => {
                        const currentHours = timeValue.split(":")[0] || "00";
                        const newTimeValue = `${currentHours}:${value.padStart(2, "0")}`;
                        handleMaskedTimeChange(newTimeValue);
                      }}
                    >
                      <SelectTrigger className="w-full" name="input-date-time-minute">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_elem, index) => {
                          const minute = String(index).padStart(2, "0");
                          return (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2 border-t border-input px-4 pt-4">
                  {[
                    { label: time ? "Now" : "Today", value: 0 },
                    { label: "Clear", value: -1 },
                  ].map(preset => (
                    <Button
                      name={`calendar-button-${preset.value}`}
                      key={preset.value}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePresetClick(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </Card>
            </PopoverContent>
          </Popover>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
