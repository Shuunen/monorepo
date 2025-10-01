import { cn, nbSpacesIndent } from '@monorepo/utils'

export function SourceCode({ className, code }: { className?: string; code: string | object }) {
  const json = typeof code === 'string' ? code : JSON.stringify(code, undefined, nbSpacesIndent)
  return (
    <pre className={cn('bg-stone-100 p-6 border-stone-300 border rounded-lg', className)} data-testid="debug-data">
      <code>{json}</code>
    </pre>
  )
}
