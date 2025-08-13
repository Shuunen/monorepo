export function Status({ error, info, progress }: { error?: string; info?: string; progress?: string }) {
  return (
    <div className="flex flex-col" data-testid="status">
      <div className="font-bold text-red-500">{error}</div>
      <div className={`transition-colors ease-in-out ${info ? 'text-inherit' : 'text-transparent'}`}>{info}</div>
      <div className="text-2xl font-light italic">{progress}</div>
    </div>
  )
}
