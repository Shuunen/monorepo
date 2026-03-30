import type { z } from "zod";
import { Paragraph, Title } from "../atoms/typography";
import { useAutoFormParentData } from "./auto-form-parent-data";
import { groupedSectionsFromEditableSteps } from "./auto-form-summary-step.utils";
import type { AutoFormData, AutoFormSummarySection } from "./auto-form.types";
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
  const parentData = useAutoFormParentData();
  const groups = groupedSectionsFromEditableSteps(props.schemas, props.formData, parentData);
  const hasData = groups.some(group =>
    group.sections.some(
      (section: AutoFormSummarySection) => Object.keys(section.data).length > 0 || (section.sections?.length ?? 0) > 0,
    ),
  );
  return (
    <div className="grid gap-8" data-testid="auto-form-summary-step">
      <Title level={1}>Summary</Title>
      {hasData ? (
        groups.map((group, groupIndex) => (
          <div className="grid gap-6" key={group.stepTitle ?? `group-${groupIndex}`}>
            {group.stepTitle && <Title level={2}>{group.stepTitle}</Title>}
            {group.sections.map((section: AutoFormSummarySection, sectionIndex: number) => (
              <div className="grid gap-3" key={section.title ?? `section-${sectionIndex}`}>
                {section.title && <Title level={3}>{section.title}</Title>}
                <FormSummary data={section.data} name={section.title ?? "no-title"} sections={section.sections} />
              </div>
            ))}
          </div>
        ))
      ) : (
        <Paragraph>No data available for summary.</Paragraph>
      )}
    </div>
  );
}
