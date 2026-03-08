import { FormLabel } from "../atoms/form";

export function RequiredMark() {
  return <span className="ml-1 text-red-500">*</span>;
}

// oxlint-disable-next-line react/no-multi-comp
export function FormFieldLabel({
  className,
  label,
  isOptional,
}: {
  className?: string;
  label?: string;
  isOptional: boolean;
}) {
  return (
    <FormLabel className={className}>
      {label}
      {!isOptional && <RequiredMark />}
    </FormLabel>
  );
}
