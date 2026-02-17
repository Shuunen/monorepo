import type { ComponentProps } from "react";
import { Calendar as ShadCalendar } from "../shadcn/calendar";
import { type NameProp, testIdFromProps } from "./form.utils";

type CalendarProps = ComponentProps<typeof ShadCalendar> & NameProp;

export function Calendar({ ...props }: CalendarProps) {
  return <ShadCalendar data-testid={testIdFromProps("calendar", props)} {...props} />;
}
