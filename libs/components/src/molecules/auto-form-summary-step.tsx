import type { z } from "zod";
import { Paragraph, Title } from "../atoms/typography";
import type { AutoFormData } from "./auto-form.types";
import { sectionsFromEditableSteps } from "./auto-form.utils";
import { FormSummary } from "./form-summary";

type Props = {
  /**
   * The schemas for all steps
   */
  schemas: z.ZodObject[];
  /**
   * The complete form data
   */
  formData: AutoFormData;
};

export function AutoFormSummaryStep(props: Props) {
  const sections = sectionsFromEditableSteps(props.schemas, props.formData);
  const hasData = sections.some(section => Object.keys(section.data).length > 0);
  return (
    <div className="grid gap-3" data-testid="auto-form-summary-step">
      <Title level={1}>Summary</Title>
      {hasData ? (
        <>
          <Paragraph>This step provides a summary of your form submission.</Paragraph>
          {sections.map((section, index) => (
            <div className="grid gap-3" key={section.title ?? `section-${index}`}>
              {section.title && <Title level={2}>{section.title}</Title>}
              <FormSummary data={section.data} name={section.title ?? "no-title"} />
            </div>
          ))}
        </>
      ) : (
        <Paragraph>No data available for summary.</Paragraph>
      )}
    </div>
  );
}
