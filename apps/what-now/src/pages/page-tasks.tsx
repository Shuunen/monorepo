import { FloatingMenu } from '@monorepo/components'
import { useState } from 'react'
import { Progress } from '../components/progress'
import { Status } from '../components/status'
import { Tasks } from '../components/tasks'
import { useActions } from '../utils/pages.utils'
import { state, watchState } from '../utils/state.utils'

export function PageTasks() {
  const [tasks, setTasks] = useState(state.tasks)
  const [error, setError] = useState(state.statusError)
  const [info, setInfo] = useState(state.statusInfo)
  const [progress, setProgress] = useState(state.statusProgress)
  const actions = useActions()
  watchState('tasks', () => setTasks(state.tasks))
  watchState('statusError', () => setError(state.statusError))
  watchState('statusInfo', () => setInfo(state.statusInfo))
  watchState('statusProgress', () => setProgress(state.statusProgress))
  return (
    <div className="flex flex-col gap-4 py-24 mx-auto" data-testid="page-tasks">
      <h1 className="-ml-2 font-bold mb-2">
        <span className="opacity-80">What</span> Now <span className="opacity-10 font-light">?</span>
      </h1>
      <Status error={error} info={info} progress={progress} />
      <Progress tasks={tasks} />
      <Tasks tasks={tasks} />
      <Progress tasks={tasks} />
      <FloatingMenu actions={actions} />
    </div>
  )
}
