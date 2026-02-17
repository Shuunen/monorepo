// oxlint-disable no-magic-numbers, max-lines-per-function
import { dateIsoToReadableDatetime, isValidDate } from "@monorepo/utils";
import { addDays } from "date-fns";
import { useRef, useState } from "react";
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

const DATE_INPUT_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const TIME_INPUT_REGEX = /^(\d{2}):(\d{2})$/;
const DIGIT_REGEX = /[0-9]/;

function parseInput(value: string): Date | undefined {
  const match = DATE_INPUT_REGEX.exec(value);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  return isValidDate(date) ? date : undefined;
}

function parseTimeInput(value: string): { hours: number; minutes: number } | undefined {
  const match = TIME_INPUT_REGEX.exec(value);
  if (!match) {
    return undefined;
  }
  const [, hh, mm] = match;
  const hours = Number.parseInt(hh, 10);
  const minutes = Number.parseInt(mm, 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return undefined;
  }
  return { hours, minutes };
}

type DatetimePickerProps = {
  time?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  className?: string;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
} & NameProp;

// oxlint-disable-next-line complexity
export function DatetimePicker({
  time = true,
  readonly = false,
  clearable = true,
  className = "",
  defaultValue,
  onChange,
  ...props
}: DatetimePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(defaultValue);
  const [month, setMonth] = useState<Date | undefined>(defaultValue ?? date);
  const [dateValue, setDateValue] = useState(dateIsoToReadableDatetime(defaultValue, false));
  const [timeValue, setTimeValue] = useState(
    defaultValue
      ? `${String(defaultValue.getHours()).padStart(2, "0")}:${String(defaultValue.getMinutes()).padStart(2, "0")}`
      : "",
  );
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleMaskedDateChange = (maskedValue: string) => {
    setDateValue(maskedValue);
    const parsedDate = parseInput(maskedValue);
    setDate(parsedDate ? new Date(parsedDate) : undefined);
    setMonth(parsedDate ? new Date(parsedDate) : undefined);

    if (time) {
      const parsedTime = parseTimeInput(timeValue);
      if (parsedDate && parsedTime) {
        const newDate = new Date(parsedDate);
        newDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
        onChange?.(newDate);
      } else {
        onChange?.(undefined);
      }
    } else if (parsedDate) {
      const newDate = new Date(parsedDate);
      newDate.setUTCHours(12, 0, 0, 0);
      onChange?.(newDate);
    } else {
      onChange?.(undefined);
    }
  };

  const handleMaskedTimeChange = (maskedValue: string) => {
    setTimeValue(maskedValue);
    const parsedTime = parseTimeInput(maskedValue);
    if (!time) {
      return;
    }
    if (date && parsedTime) {
      const newDate = new Date(date);
      newDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
      onChange?.(newDate);
    } else {
      onChange?.(undefined);
    }
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
      setTimeValue(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
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
    <InputGroup className={cn(className, !time && "min-w-48")} name="datetime-picker">
      <IMaskInput
        data-testid={testIdFromProps("date-picker", props)}
        className={cn(
          "min-w-0 flex-2 px-3 py-1 text-base outline-0",
          (dateValue === "" || readonly) && "text-muted-foreground",
        )}
        id={`date-required-${props.name}`}
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
            const isAtEnd = target.selectionStart === target.value.length;
            const isDigit = event.key.length === 1 && DIGIT_REGEX.test(event.key);
            if (isDigit && isAtEnd && target.value.length === 10) {
              event.preventDefault();
              timeInputRef.current?.focus();
            }
          }
        }}
      />
      {time && (
        <>
          <Separator orientation="vertical" className="h-1/2!" />
          <IMaskInput
            data-testid={testIdFromProps("time-picker", props)}
            inputRef={timeInputRef}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Backspace" && (timeValue === "--:--" || timeValue === "")) {
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
        </>
      )}
      <InputGroupAddon align="inline-end">
        {clearable && (dateValue !== "" || (timeValue !== "" && timeValue !== "--:--")) && (
          <InputGroupButton
            name={`date-clear-${props.name}`}
            variant="ghost"
            size="icon-xs"
            aria-label="Clear date"
            disabled={readonly}
            onClick={handleClear}
          >
            <IconX />
            <span className="sr-only">Clear date</span>
          </InputGroupButton>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              name={`date-picker-${props.name}`}
              variant="ghost"
              size="icon-xs"
              aria-label="Select date"
              disabled={readonly}
            >
              <IconCalendar />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden border-0 p-0" align="end" alignOffset={-8} sideOffset={10}>
            <Card
              className="max-w-75 gap-0 border border-input py-4"
              onClick={(event: { stopPropagation: () => void }) => event.stopPropagation()}
            >
              <CardContent className="mb-2 px-4">
                <Calendar
                  name="datetime-picker"
                  required={false}
                  mode="single"
                  selected={date}
                  month={month}
                  captionLayout="dropdown"
                  onMonthChange={setMonth}
                  onSelect={calendarDate => {
                    // Fix: always store/date as UTC so display matches local pick
                    const newDate = calendarDate
                      ? new Date(
                          Date.UTC(
                            calendarDate.getFullYear(),
                            calendarDate.getMonth(),
                            calendarDate.getDate(),
                            0,
                            0,
                            0,
                            0,
                          ),
                        )
                      : undefined;
                    if (time && newDate) {
                      const timeData = parseTimeInput(timeValue);
                      if (timeData) {
                        newDate.setUTCHours(timeData.hours);
                        newDate.setUTCMinutes(timeData.minutes);
                      }
                    }
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
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-2 text-sm">Time selection</span>
                  <Select
                    name="time-hour"
                    value={timeValue.split(":")[0] || ""}
                    onValueChange={value => {
                      const currentMinutes = timeValue.split(":")[1] || "00";
                      const newTimeValue = `${value.padStart(2, "0")}:${currentMinutes}`;
                      handleMaskedTimeChange(newTimeValue);
                    }}
                  >
                    <SelectTrigger className="w-full" name="time-hour">
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
                    name="time-minute"
                    value={timeValue.split(":")[1] || ""}
                    onValueChange={value => {
                      const currentHours = timeValue.split(":")[0] || "00";
                      const newTimeValue = `${currentHours}:${value.padStart(2, "0")}`;
                      handleMaskedTimeChange(newTimeValue);
                    }}
                  >
                    <SelectTrigger className="w-full" name="time-minute">
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
      </InputGroupAddon>
    </InputGroup>
  );
}
