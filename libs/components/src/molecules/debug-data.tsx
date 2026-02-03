import { cn, slugify, stringify } from "@monorepo/utils";

type Props = Readonly<{
  className?: string;
  data: string | object | undefined | unknown;
  isFloating?: boolean;
  isGhost?: boolean;
  isScrollable?: boolean;
  title?: string;
}>;

export function DebugData({ className, data, isFloating = false, isScrollable = true, title, isGhost }: Props) {
  const testId = title ? `debug-data-${slugify(title)}` : "debug-data";
  const json = stringify(data, true);
  const classes = cn(
    "relative max-w-full shrink-0 rounded-lg border border-stone-300 bg-stone-100 p-6 shadow-lg dark:bg-stone-800",
    className,
    {
      "fixed right-5 top-28": isFloating,
      "opacity-30 hover:opacity-100 transition-opacity": isGhost,
      "overflow-y-auto max-h-96": isScrollable,
    },
  );
  return (
    <pre className={classes}>
      {title && (
        <strong className="absolute right-0 bottom-0 rounded bg-white px-2 shadow dark:bg-stone-900">{title}</strong>
      )}
      <code data-testid={testId}>{json}</code>
    </pre>
  );
}
