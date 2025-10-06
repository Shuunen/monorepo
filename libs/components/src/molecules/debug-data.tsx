import { cn } from '@monorepo/utils'

type Props = Readonly<{
  className?: string
  data: string | object | undefined
  isFloating?: boolean
  isScrollable?: boolean
}>

export function stringify(data: Props['data']) {
  const spaceIndent = 2
  return typeof data === 'string' ? data : JSON.stringify(data, undefined, spaceIndent)
}

export function DebugData({ className, data, isFloating = false, isScrollable = true }: Props) {
  const json = stringify(data)
  const classes = cn('bg-stone-100 p-6 border-stone-300 border rounded-lg shadow-lg max-w-full shrink-0', className, isFloating && 'fixed right-5 top-28', isScrollable && 'overflow-y-auto max-h-96')
  return (
    <pre className={classes} data-testid="debug-data" role="document">
      <code>{json}</code>
    </pre>
  )
}
