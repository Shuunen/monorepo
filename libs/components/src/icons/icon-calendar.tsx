import { Calendar } from "lucide-react";
import type React from "react";

export function IconCalendar({ className, ...props }: React.ComponentProps<typeof Calendar>) {
  return <Calendar className={className} {...props} />;
}
