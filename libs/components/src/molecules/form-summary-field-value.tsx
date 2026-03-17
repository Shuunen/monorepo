import { downloadFile, slugify } from "@monorepo/utils";
import { isNil } from "es-toolkit";
import { TableCell } from "../atoms/table";
import { IconDownload } from "../icons/icon-download";
import { getFormSummaryContent } from "./form-summary-field-value.utils";

export function FormSummaryFieldValue({ value, name }: { name: string; value: unknown }) {
  if (value instanceof File) {
    return (
      <TableCell>
        <a
          className="flex cursor-pointer items-center gap-2 underline"
          data-testid={slugify(`summary-file-${name}`)}
          onClick={() => downloadFile(value)}
        >
          <IconDownload /> {value.name}
        </a>
      </TableCell>
    );
  }
  const content = getFormSummaryContent(value);
  if (isNil(value)) {
    return <TableCell className="italic opacity-30">{content}</TableCell>;
  }
  return <TableCell className="whitespace-normal">{content}</TableCell>;
}
