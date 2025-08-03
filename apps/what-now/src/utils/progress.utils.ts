import { nbSixth } from '@shuunen/shuutils'
import { state } from './state.utils'
import { isTaskActive, minutesRemaining } from './tasks.utils'

export function trmnlPayload(progress = 0) {
  const activeTasks = state.tasks.filter(task => isTaskActive(task))
  const firstTask = activeTasks[0]
  const payload = {
    // biome-ignore lint/style/useNamingConvention: that's what trmnl webhook expects
    merge_variables: {
      date: new Date().toTimeString().slice(0, nbSixth), // 5 characters will give hh:mm
      nextSubtitle: firstTask?.reason,
      nextTitle: firstTask?.name,
      progress,
      remaining: `${minutesRemaining(activeTasks)} min to take care`,
    },
  }
  return JSON.stringify(payload)
}
