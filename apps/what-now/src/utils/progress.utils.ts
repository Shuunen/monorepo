import { state } from './state.utils'
import { isTaskActive, minutesRemaining } from './tasks.utils'

export function webhookPayload(progress = 0) {
  const activeTasks = state.tasks.filter(task => isTaskActive(task))
  const firstTask = activeTasks[0]
  const minutes = minutesRemaining(activeTasks)
  return `progress=${progress}&remaining=${minutes}&nextTask=${firstTask?.name}`
}
