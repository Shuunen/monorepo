import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { Paragraph, Title } from "../atoms/typography";
import type { AutoFormData } from "./auto-form.types";
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
  /** Custom content rendered with current form values. Must be used inside a react-hook-form FormProvider. */
  customRender?: (formData: AutoFormData) => ReactNode;
};

// We have a dedicated component for the custom render to avoid re-rendering the section when the form data changes
// Maybe in the future we can only watch data needed for the render and not the whole form data
function CustomRenderContent({ customRender }: { customRender: (formData: AutoFormData) => ReactNode }) {
  const formData = useWatch<AutoFormData>();
  return <>{customRender(formData)}</>;
}

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
      {props.customRender && <CustomRenderContent customRender={props.customRender} />}
      {props.code && <DebugData data={props.code} />}
      {props.line && <div className="mt-2 mb-4 border-t border-muted" />}
    </div>
  );
}
