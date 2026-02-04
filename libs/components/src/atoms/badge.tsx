import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Badge as ShadBadge } from "../shadcn/badge";
import { cn } from "../shadcn/utils";
import { type NameProp, testIdFromProps } from "./form.utils";

type BadgeProps = ComponentProps<typeof ShadBadge> &
  NameProp &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        destructive:
          "border-transparent bg-destructive/10 text-black focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        success:
          "border-transparent bg-success/10 text-black focus-visible:ring-success/20 dark:bg-success/60 dark:focus-visible:ring-success/40 [a&]:hover:bg-success/90",
        "table-failure": "border-transparent bg-destructive/20 text-black",
        "table-success": "border-transparent bg-success/20 text-black",
        "table-warning": "border-transparent bg-warning/20 text-black",
        warning:
          "border-transparent bg-warning text-white focus-visible:ring-warning/20 dark:bg-warning/60 dark:focus-visible:ring-warning/40 [a&]:hover:bg-warning/90",
      },
    },
  },
);

export function Badge({ children, variant, className = "", asChild = false, ...props }: BadgeProps) {
  return (
    <ShadBadge
      asChild={asChild}
      className={cn(badgeVariants({ className, variant }))}
      data-testid={testIdFromProps("badge", props)}
      variant={variant}
      {...props}
    >
      {children}
    </ShadBadge>
  );
}
