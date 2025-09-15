import { Converter } from './converter'

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col justify-center items-center p-24">
      <div className="prose prose-lg w-full max-w-screen">
        <h1 className="text-4xl font-bold mb-8 text-center">Regex Converter</h1>
        <Converter />
      </div>
    </div>
  )
}
