import { Paragraph, Title } from "../atoms/typography";
import { DebugData } from "./debug-data";
import { RequiredMark } from "./form-field.utils";

export type FormFieldSectionProps = {
  /** Optional title text */
  title?: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional description text */
  description?: string;
  /** Optional code block content to display */
  code?: string;
  /** Optional line **/
  line?: boolean;
  /** Optional label that mimic a form field label */
  label?: string;
  /** whether the label should have a star to indicate it's required, only relevant if label is provided */
  labelStar?: boolean;
};

export function FormFieldSection(props: FormFieldSectionProps) {
  return (
    <div className="grid gap-2">
      {props.title && <Title className="mt-4">{props.title}</Title>}
      {props.subtitle && <Title level={2}>{props.subtitle}</Title>}
      {props.label && (
        <div className="text-lg">
          {props.label}
          {props.labelStar && <RequiredMark />}
        </div>
      )}
      {props.description && <Paragraph className="mb-4 text-muted-foreground">{props.description}</Paragraph>}
      {props.code && <DebugData data={props.code} />}
      {props.line && <div className="mt-2 mb-4 border-t border-muted" />}
    </div>
  );
}
