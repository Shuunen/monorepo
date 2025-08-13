import { div, tw } from '@shuunen/shuutils'
import type { Task } from '../types'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'
import { minutesRemaining } from '../utils/tasks.utils'
import { credentials } from './credentials'

const timer = div(tw('app-timer fixed bottom-8 right-5 cursor-help select-none text-right text-5xl font-thin leading-10 text-gray-700'))

/**
 * Callback when tasks are loaded
 * @param tasks - the tasks
 */
function onTaskLoaded(tasks: Task[]) {
  logger.info('timer, on tasks loaded')
  const minutes = minutesRemaining(tasks)
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
