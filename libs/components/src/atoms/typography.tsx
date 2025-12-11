import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "react";
import { cn } from "../shadcn/utils";

const titleVariants = cva("font-semibold tracking-tight", {
  defaultVariants: {
    level: 1,
    variant: "default",
  },
  variants: {
    level: {
      1: "text-2xl font-bold",
      2: "text-xl",
      3: cn("text-base font-semibold"),
      4: "text-base",
    },
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
    },
  },
});

type TitleProps = VariantProps<typeof titleVariants> & {
  /**
   * The content of the title
   */
  children: React.ReactNode;
  /**
   * If you need to override the default styles
   */
  className?: string;
  /**
   * The level of the title (1, 2, or 3)
   */
  // oxlint-disable-next-line no-magic-numbers
  level?: 1 | 2 | 3 | 4;
};

/**
 * Title component for headings
 * @param props the props for the Title component
 * @param props.children the content of the title
 * @param props.level the level of the title (1, 2, or 3), default is 1
 * @param props.variant the variant of the title (default, muted, primary, secondary)
 * @param props.className additional class names to apply to the title
 * @returns a styled title component
 */
export function Title({ children, level = 1, variant = "default", className = "" }: TitleProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={cn(titleVariants({ level, variant }), className)} data-testid={`title-level-${level}`}>
      {children}
    </Tag>
  );
}

type ParagraphProps = VariantProps<typeof paragraphVariants> & {
  /**
   * The content of the paragraph
   */
  children: React.ReactNode;
  /**
   * If you need to override the default styles
   */
  className?: string;
};

const paragraphVariants = cva("leading-relaxed", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "text-foreground",
      error: "text-destructive text-sm",
      muted: "text-muted-foreground text-sm",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
    },
  },
});

export function Paragraph({ children, variant = "default", className = "" }: ParagraphProps) {
  return (
    <p className={cn(paragraphVariants({ variant }), className)} data-testid="paragraph">
      {children}
    </p>
  );
}
