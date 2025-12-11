import { flatten } from "@monorepo/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../atoms/table";
import { FormSummaryFieldValue } from "./form-summary-field-value";

type Props = {
  data: Record<string, unknown>;
  rootPath?: string;
};

export function FormSummary(props: Props) {
  const flatData = flatten(props.data, props.rootPath ?? "data");
  const entries = Object.entries(flatData);
  return (
    <div className="border rounded-lg w-full overflow-hidden" data-testid="form-summary">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Key</TableHead>
            <TableHead className="w-1/2">Value</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="max-h-96 w-full overflow-y-auto overflow-x-hidden">
        <Table>
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow className="grid grid-cols-2" key={key}>
                <TableCell className="font-mono text-xs">{key}</TableCell>
                <FormSummaryFieldValue name={key} value={value} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
