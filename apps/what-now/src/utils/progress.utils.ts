import { nbSixth } from '@monorepo/utils'
import { state } from './state.utils'
import { isTaskActive, minutesRemaining } from './tasks.utils'

export function trmnlPayload(progress = 0, sendDate = false) {
  const activeTasks = state.tasks.filter(task => isTaskActive(task))
  const firstTask = activeTasks[0]
  const minutes = minutesRemaining(activeTasks)
  const payload = {
    // biome-ignore lint/style/useNamingConvention: that's what trmnl webhook expects
    merge_variables: {
      date: sendDate ? new Date().toTimeString().slice(0, nbSixth) : undefined, // 5 characters will give hh:mm
      nextSubtitle: firstTask?.reason,
      nextTitle: firstTask?.name,
      progress,
      remaining: minutes ? `${minutes} min to take care` : undefined,
    },
  }
  return JSON.stringify(payload)
}
