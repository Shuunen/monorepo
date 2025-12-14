import { cn, slugify, stringify } from "@monorepo/utils";

type Props = Readonly<{
  className?: string;
  data: string | object | undefined;
  isFloating?: boolean;
  isGhost?: boolean;
  isScrollable?: boolean;
  title?: string;
}>;

export function DebugData({ className, data, isFloating = false, isScrollable = true, title, isGhost }: Props) {
  const testId = title ? `debug-data-${slugify(title)}` : "debug-data";
  const json = stringify(data, true);
  const classes = cn("relative bg-stone-100 dark:bg-stone-800 p-6 border-stone-300 border rounded-lg shadow-lg max-w-full shrink-0", className, {
    "fixed right-5 top-28": isFloating,
    "opacity-30 hover:opacity-100 transition-opacity": isGhost,
    "overflow-y-auto max-h-96": isScrollable,
  });
  return (
    <pre className={classes}>
      {title && <strong className="absolute right-0 bottom-0 bg-white dark:bg-stone-900 px-2 rounded shadow">{title}</strong>}
      <code data-testid={testId}>{json}</code>
    </pre>
  );
}
