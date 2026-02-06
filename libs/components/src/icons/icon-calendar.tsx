import type React from "react";
import { Calendar } from "lucide-react";

export function IconCalendar({ className, ...props }: React.ComponentProps<typeof Calendar>) {
  return <Calendar className={className} {...props} />;
}
