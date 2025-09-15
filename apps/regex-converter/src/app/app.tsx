import { OwlIcon, TypewriterEffectSmooth } from '@monorepo/components'
import { Converter } from './converter'

export function App() {
  const words = [
    {
      text: 'Regex',
    },
    {
      className: 'text-primary',
      text: 'Converter',
    },
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/15 flex flex-col justify-center items-center p-24">
      <div className="prose prose-lg w-full max-w-screen">
        <h1 className="flex justify-center mt-0 text-center">
          <TypewriterEffectSmooth className="mt-0 mb-0" words={words} />
        </h1>
        <Converter />
        <span className="text-sm text-center block w-full text-muted-foreground italic mt-12">__unique-mark__</span>
        <OwlIcon className="opacity-10 text-primary w-12 mx-auto mt-12" />
      </div>
    </div>
  )
}
