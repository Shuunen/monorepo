import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Badge as ShadBadge } from "../shadcn/badge";
import { cn } from "../shadcn/utils";
import { type NameProp, testIdFromProps } from "./form.utils";

type BadgeProps = ComponentProps<typeof ShadBadge> & NameProp & VariantProps<typeof badgeVariants> & { asChild?: boolean };

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        warning: "border-transparent bg-warning text-white [a&]:hover:bg-warning/90 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40 dark:bg-warning/60",
      },
    },
  },
);

export function Badge({ children, variant, className = "", asChild = false, ...props }: BadgeProps) {
  return (
    <ShadBadge asChild={asChild} className={cn(badgeVariants({ className, variant }))} data-testid={testIdFromProps("badge", props)} variant={variant} {...props}>
      {children}
    </ShadBadge>
  );
}
