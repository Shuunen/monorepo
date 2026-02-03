/** biome-ignore-all lint/a11y/useValidAnchor: fix that later */
import { slugify, stringify } from "@monorepo/utils";
import { TableCell } from "../atoms/table";
import { IconDownload } from "../icons/icon-download";

type Props = {
  name: string;
  value: unknown;
};

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function FormSummaryFieldValue({ value, name }: Props) {
  // @ts-expect-error includes doesn't allow unknown as parameter
  // oxlint-disable-next-line unicorn/no-null
  if ([undefined, null].includes(value)) {
    return <TableCell className="overflow-hidden text-ellipsis italic opacity-30">not specified</TableCell>;
  }

  if (value instanceof Date) {
    return <TableCell className="overflow-hidden text-ellipsis">{String(value)}</TableCell>;
  }

  if (value instanceof File) {
    return (
      <TableCell className="overflow-hidden text-ellipsis">
        {/** biome-ignore lint/a11y/noStaticElementInteractions: fix that later */}
        <a
          className="flex cursor-pointer items-center gap-2 underline"
          data-testid={slugify(`summary-file-${name}`)}
          onClick={() => downloadFile(value as File)}
        >
          <IconDownload /> {value.name}
        </a>
      </TableCell>
    );
  }

  return <TableCell className="overflow-hidden text-ellipsis">{stringify(value)}</TableCell>;
}
