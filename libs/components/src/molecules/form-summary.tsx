import { type NameProp, testIdFromProps } from "../atoms/form.utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../atoms/table";
import { FormSummaryFieldValue } from "./form-summary-field-value";

/** Data structure representing the summary information of a form */
export type FormSummaryData = Record<
  string,
  {
    /** The display label of the form field */
    label: string;
    /** The value of the form field */
    value: unknown;
  }
>;

type FormSummaryProps = { data: FormSummaryData } & NameProp;

export function FormSummary(props: FormSummaryProps) {
  const entries = Object.entries(props.data);
  return (
    <div className="w-full overflow-hidden" data-testid={testIdFromProps("form-summary", props)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Label</TableHead>
            <TableHead className="w-1/2">Value</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="max-h-96 w-full overflow-x-hidden overflow-y-auto">
        <Table>
          <TableBody>
            {entries.map(([key, data]) => (
              <TableRow className="grid grid-cols-2" key={key}>
                <TableCell className="overflow-hidden text-ellipsis">{data.label}</TableCell>
                <FormSummaryFieldValue name={key} value={data.value} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
