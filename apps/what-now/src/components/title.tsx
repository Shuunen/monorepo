import { clsx } from 'clsx'

export function Title({ subtitle, oneLine = false }: { subtitle?: string; oneLine?: boolean }) {
  return (
    <div className={clsx('flex items-center gap-4', { 'flex-col': !oneLine, 'mx-auto': oneLine })} data-testid="title">
      <h1 className={clsx('text-3xl text-blue-300 sm:text-5xl', { 'text-5xl -ml-2 sm:text-7xl': !oneLine })} title="__unique-mark__">
        What now
      </h1>
      {subtitle !== undefined && <h2 className="text-3xl text-blue-200/50 sm:text-5xl">{subtitle}</h2>}
    </div>
  )
}
