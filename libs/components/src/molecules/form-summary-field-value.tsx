/** biome-ignore-all lint/a11y/useValidAnchor: fix that later */
import { slugify } from "@monorepo/utils";
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

export function FormSummaryFieldValue(props: Props) {
  if (props.value === undefined) {
    return <TableCell className="overflow-hidden text-ellipsis italic opacity-30">not specified</TableCell>;
  }

  if (props.value instanceof File) {
    return (
      <TableCell className="overflow-hidden text-ellipsis">
        {/** biome-ignore lint/a11y/noStaticElementInteractions: fix that later */}
        <a className="flex items-center gap-2 underline cursor-pointer" data-testid={slugify(`summary-file-${props.name}`)} onClick={() => downloadFile(props.value as File)}>
          <IconDownload /> {props.value.name}
        </a>
      </TableCell>
    );
  }

  return <TableCell className="overflow-hidden text-ellipsis">{String(props.value)}</TableCell>;
}
