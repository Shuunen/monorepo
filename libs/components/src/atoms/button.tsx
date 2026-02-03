import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Button as ShadButton } from "../shadcn/button";
import { cn } from "../shadcn/utils";
import { type NameProp, testIdFromProps } from "./form.utils";

type ButtonProps = ComponentProps<typeof ShadButton> & VariantProps<typeof buttonVariants> & NameProp;

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-[10px] has-[>svg]:px-3",
        icon: "h-9 px-[10px] py-[10px] has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      },
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        success:
          "bg-success text-white shadow-xs hover:bg-success/90 focus-visible:ring-success/20 dark:bg-success/60 dark:focus-visible:ring-success/40",
      },
    },
  },
);

export function Button({ children, variant, size, className = "", asChild = false, disabled, ...props }: ButtonProps) {
  const classes = `${className} ${disabled ? cn("cursor-not-allowed grayscale") : cn("cursor-pointer")}`;
  return (
    <ShadButton
      asChild={asChild}
      className={cn(buttonVariants({ className, size, variant }), classes)}
      data-testid={testIdFromProps("button", props)}
      disabled={disabled}
      size={size}
      variant={variant}
      {...props}
    >
      {children}
    </ShadButton>
  );
}
