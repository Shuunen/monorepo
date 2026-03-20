import { FormLabel } from "../atoms/form";
import type { NameProp } from "../atoms/form.utils";

export function RequiredMark() {
  return <span className="ml-1 text-red-500">*</span>;
}

type FormFieldLabelProps = {
  className?: string;
  label?: string;
  isOptional: boolean;
} & NameProp;

// oxlint-disable-next-line react/no-multi-comp
export function FormFieldLabel({ className, label, isOptional, name }: FormFieldLabelProps) {
  return (
    <FormLabel className={className} name={name}>
      {label}
      {!isOptional && <RequiredMark />}
    </FormLabel>
  );
}
