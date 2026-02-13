import { cn } from "@monorepo/utils";
import type { ComponentProps, ElementType } from "react";
import { Input as ShadInput } from "../shadcn/input";
import { type NameProp, testIdFromProps } from "./form.utils";

type InputProps = ComponentProps<typeof ShadInput> & {
  icon?: ElementType<{ className?: string }>;
} & NameProp;

export function Input({ icon: Icon, ...props }: InputProps) {
  const testId = testIdFromProps(`input-${props.type ?? "text"}`, props);
  if (!Icon) {
    return <ShadInput data-testid={testId} {...props} />;
  }
  return (
    <div className="relative">
      <div className="absolute top-2 left-2 bg-transparent">
        <Icon className={cn("size-5", props.disabled && "stroke-current text-gray-400")} />
      </div>
      <ShadInput data-testid={testId} {...props} />
    </div>
  );
}
