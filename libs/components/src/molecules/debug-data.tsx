import { cn, slugify } from '@monorepo/utils'

type Props = Readonly<{
  className?: string
  data: string | object | undefined
  isFloating?: boolean
  isScrollable?: boolean
  title?: string
}>

export function stringify(data: Props['data']) {
  const spaceIndent = 2
  return typeof data === 'string' ? data : JSON.stringify(data, undefined, spaceIndent)
}

export function DebugData({ className, data, isFloating = false, isScrollable = true, title }: Props) {
  const testId = title ? `debug-data-${slugify(title)}` : 'debug-data'
  const json = stringify(data)
  const classes = cn('relative bg-stone-100 p-6 border-stone-300 border rounded-lg shadow-lg max-w-full shrink-0', className, isFloating && 'fixed right-5 top-28', isScrollable && 'overflow-y-auto max-h-96')
  return (
    <pre className={classes}>
      {title && <strong className="absolute right-0 bottom-0 bg-white px-2 rounded shadow">{title}</strong>}
      <code data-testid={testId}>{json}</code>
    </pre>
  )
}
