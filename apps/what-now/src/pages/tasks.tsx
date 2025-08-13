import { useState } from 'react'
import { Progress } from '../components/progress'
import { Status } from '../components/status'
import { Tasks } from '../components/tasks'
import { Timer } from '../components/timer'
import { Title } from '../components/title'
import { state, watchState } from '../utils/state.utils'

export function PageTasks() {
  const [tasks, setTasks] = useState(state.tasks)
  const [error, setError] = useState(state.statusError)
  const [info, setInfo] = useState(state.statusInfo)
  const [progress, setProgress] = useState(state.statusProgress)
  watchState('tasks', () => setTasks(state.tasks))
  watchState('statusError', () => setError(state.statusError))
  watchState('statusInfo', () => setInfo(state.statusInfo))
  watchState('statusProgress', () => setProgress(state.statusProgress))
  return (
    <div className="flex flex-col mx-auto max-w-fit" data-testid="page-tasks">
      <Title />
      <Status error={error} info={info} progress={progress} />
      <Progress tasks={tasks} />
      <Tasks tasks={tasks} />
      <Timer tasks={tasks} />
    </div>
  )
}
