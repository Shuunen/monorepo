import type { ComponentProps } from "react";
import { Calendar as ShadCalendar } from "../shadcn/calendar";
import { type NameProp, testIdFromProps } from "./form.utils";

type CalendarProps = ComponentProps<typeof ShadCalendar> & NameProp;

const minYear = 1900;

export function Calendar({ ...props }: CalendarProps) {
  const targetProps = {
    startMonth: new Date(minYear, 0),
    ...props,
  };
  return <ShadCalendar data-testid={testIdFromProps("calendar", targetProps)} {...targetProps} />;
}
