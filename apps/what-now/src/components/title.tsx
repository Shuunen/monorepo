export function Title({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col gap-4" data-testid="title">
      <h1 className="-ml-2 text-5xl text-blue-300 sm:text-7xl" title="__unique-mark__">
        What now
      </h1>
      {subtitle !== undefined && <h2 className="text-3xl text-blue-200/50 sm:text-5xl">{subtitle}</h2>}
    </div>
  )
}
