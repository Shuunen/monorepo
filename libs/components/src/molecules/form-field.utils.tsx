import { FormLabel } from "../atoms/form";

export function RequiredMark() {
  return <span className="text-red-500 ml-1">*</span>;
}

export function FormFieldLabel({ className, label, isOptional }: { className?: string; label?: string; isOptional: boolean }) {
  return (
    <FormLabel className={className}>
      {label}
      {!isOptional && <RequiredMark />}
    </FormLabel>
  );
}
