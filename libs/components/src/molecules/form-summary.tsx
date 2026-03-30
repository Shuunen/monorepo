import { type NameProp, testIdFromProps } from "../atoms/form.utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../atoms/table";
import { Title } from "../atoms/typography";
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

type FormSummarySection = {
  data: FormSummaryData;
  sections?: FormSummarySection[];
  title?: string;
};

type FormSummaryProps = { data: FormSummaryData; sections?: FormSummarySection[] } & NameProp;

function FormSummaryTable({ entries }: { entries: [string, { label: string; value: unknown }][] }) {
  if (entries.length === 0) {
    return undefined;
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="grid grid-cols-[320px_1fr]">
            <TableHead>Label</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="w-full">
        <Table>
          <TableBody>
            {entries.map(([key, data]) => (
              <TableRow className="grid grid-cols-[320px_1fr]" key={key}>
                <TableCell className="whitespace-normal">{data.label}</TableCell>
                <FormSummaryFieldValue name={key} value={data.value} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function FormSummarySections({ sections }: { sections: FormSummarySection[] }) {
  return sections.map((section, index) => {
    const title = section.title ?? `Nested Section ${index + 1}`;
    return (
      <div className="grid gap-3 pt-4 pl-4" key={title} data-testid={`form-summary-section-${title}`}>
        {section.title && <Title level={4}>{section.title}</Title>}
        <FormSummaryTable entries={Object.entries(section.data)} />
        {section.sections && <FormSummarySections sections={section.sections} />}
      </div>
    );
  });
}

// oxlint-disable-next-line react/no-multi-comp
export function FormSummary(props: FormSummaryProps) {
  const entries = Object.entries(props.data);
  return (
    <div className="w-full overflow-hidden" data-testid={testIdFromProps("form-summary", props)}>
      <FormSummaryTable entries={entries} />
      {props.sections && <FormSummarySections sections={props.sections} />}
    </div>
  );
}
