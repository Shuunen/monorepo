import { formatDate, stringify } from "@monorepo/utils";
import { isNil } from "es-toolkit";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export function getFormSummaryContent(value: unknown): string {
  if (isNil(value)) {
    return "Not specified";
  }
  if (value instanceof Date || (typeof value === "string" && dateRegex.test(value))) {
    return formatDate(new Date(value), "dd/MM/yyyy");
  }
  if (typeof value === "string" && dateTimeRegex.test(value)) {
    return formatDate(new Date(value), "dd/MM/yyyy - HH:mm");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return stringify(value);
}
