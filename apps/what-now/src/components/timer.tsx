import type { Task } from '../types'
import { minutesRemaining } from '../utils/tasks.utils'

export function Timer({ tasks }: { tasks: Task[] }) {
  const minutes = minutesRemaining(tasks)
  const lines = minutes > 0 ? [minutes, 'min'] : []
  return (
    <div className="fixed bottom-8 right-5 text-right text-5xl font-thin leading-10 text-gray-700 bg-transparent border-0 p-0">
      {lines.map(line => (
        <div key={`${line}-${lines.length}`}>{line}</div>
      ))}
    </div>
  )
}
