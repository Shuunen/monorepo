import { Paragraph, Title } from "../atoms/typography";
import { FormSummary } from "./form-summary";

type Props = {
  /**
   * The data to summarize
   */
  data?: Record<string, unknown>;
};

export function AutoFormSummaryStep(props: Props) {
  return (
    <div className="grid gap-3" data-testid="auto-form-summary-step">
      <Title level={1}>Summary</Title>
      {props.data ? (
        <>
          <Paragraph>This step provides a summary of your form submission.</Paragraph>
          <FormSummary data={props.data} />
        </>
      ) : (
        <Paragraph>No data available for summary.</Paragraph>
      )}
    </div>
  );
}
