import type { ComponentProps } from "react";
import {
  FormDescription as ShadFormDescription,
  FormMessage as ShadFormMessage,
  FormLabel as ShadFormLabel,
} from "../shadcn/form";
import { type NameProp, testIdFromProps } from "./form.utils";

type FormMessageProps = ComponentProps<typeof ShadFormMessage> & NameProp;

export function FormMessage({ ...props }: FormMessageProps) {
  return <ShadFormMessage data-testid={testIdFromProps("form-message", props)} {...props} role="alert" />;
}

type FormDescriptionProps = ComponentProps<typeof ShadFormDescription> & NameProp;

export function FormDescription({ ...props }: FormDescriptionProps) {
  return <ShadFormDescription data-testid={testIdFromProps("form-description", props)} {...props} />;
}

type FormLabelProps = ComponentProps<typeof ShadFormLabel> & NameProp;

export function FormLabel({ ...props }: FormLabelProps) {
  return <ShadFormLabel data-testid={testIdFromProps("form-label", props)} {...props} />;
}

// oxlint-disable-next-line only-export-components
export { Form, FormControl, FormField, FormItem, useFormField } from "../shadcn/form";
