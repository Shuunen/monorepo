import { div, tw } from '@shuunen/shuutils'
import type { Task } from '../types'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'
import { isTaskActive } from '../utils/tasks.utils'
import { credentials } from './credentials'

const timer = div(tw('app-timer fixed bottom-8 right-5 cursor-help select-none text-right text-5xl font-thin leading-10 text-gray-700'))

/**
 * Callback when tasks are loaded
 * @param tasks - the tasks
 */
function onTaskLoaded(tasks: ReadonlyArray<Readonly<Task>>) {
  logger.info('timer, on tasks loaded')
  let minutes = 0
  for (const task of tasks) if (isTaskActive(task)) minutes += task.minutes
  timer.innerHTML = minutes > 0 ? `${minutes}<br>min` : ''
}

timer.addEventListener('dblclick', () => {
  credentials.classList.toggle('hidden')
})

watchState('tasks', () => {
  onTaskLoaded(state.tasks)
})

watchState('isSetup', () => {
  onTaskLoaded(state.tasks)
})

export { timer }
