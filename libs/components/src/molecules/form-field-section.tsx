import { Paragraph, Title } from "../atoms/typography";
import { DebugData } from "./debug-data";

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
};

export function FormFieldSection({ title, subtitle, description, code, line }: FormFieldSectionProps) {
  return (
    <div className="grid gap-2">
      {title && <Title className="mt-4">{title}</Title>}
      {subtitle && <Title level={2}>{subtitle}</Title>}
      {description && <Paragraph className="text-muted-foreground mb-4">{description}</Paragraph>}
      {code && <DebugData data={code} />}
      {line && <div className="border-t border-muted my-4" />}
    </div>
  );
}
