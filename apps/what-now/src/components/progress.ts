// oxlint-disable no-magic-numbers
import { debounce, dom, nbPercentMax, tw } from '@shuunen/shuutils'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'
import { isTaskActive } from '../utils/tasks.utils'

const progress = dom('hr', tw('app-progress mb-4 mt-1'))
progress.style.width = '0'

function counterText(percent = 0) {
  if (!percent) return 'Nothing done... yet'
  if (percent <= 25) return 'Amuse-bouche : check'
  if (percent <= 33) return 'Now we are talking'
  if (percent <= 50) return 'Halfway to heaven'
  if (percent <= 75) return 'Final chapter for today'
  if (percent < 100) return 'Lasts tasks remaining !'
  return 'You made it, well done dude :)'
}
async function emitHueColor(percent = 0) {
  if (state.hueEndpoint === '') {
    logger.info('no hue endpoint defined')
    return
  }
  const options = {
    body: `progress=${percent}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    mode: 'no-cors',
  } as const
  const response = await fetch(state.hueEndpoint, options).catch((error: unknown) => ({ ok: false, reason: (error as Error).message }))
  logger.info('emitted hue color', response)
}
function getProgressBackground(percent = 0) {
  if (percent <= 10) return 'from-red-700 to-red-800'
  if (percent <= 20) return 'from-red-800 to-orange-700'
  if (percent <= 30) return 'from-orange-700 to-yellow-700'
  if (percent <= 40) return 'from-yellow-700 to-yellow-800'
  if (percent <= 50) return 'from-yellow-800 to-yellow-900'
  if (percent <= 60) return 'from-yellow-900 to-green-700'
  if (percent <= 70) return 'from-green-700 to-green-800'
  if (percent <= 80) return 'from-green-800 to-green-900'
  if (percent <= 90) return 'from-green-900 to-green-950'
  return 'from-green-950 to-green-950'
}

function showProgressBackground(percent = 0) {
  logger.info(`show progress background for ${percent}%`)
  const target = getProgressBackground(percent)
  document.body.className = document.body.className.replace(/from-\w+-\d+ to-\w+-\d+/giu, target)
}

function showProgressSync() {
  const total = state.tasks.length
  const remaining = state.tasks.filter(task => isTaskActive(task)).length
  const percent = nbPercentMax - Math.round((remaining / total) * nbPercentMax)
  logger.info('show progress', { percent, remaining, total })
  progress.style.width = `${percent}%`
  document.body.dataset.progress = String(percent)
  state.statusProgress = counterText(percent)
  showProgressBackground(percent)
  void emitHueColor(percent)
}

const showProgress = debounce(showProgressSync, 300)

// async function fakeProgress () {
//   for (let percent = 0; percent <= nbPercentMax; percent += 10) {
//     showProgressBackground(percent)
//     await sleep(2000)
//   }
// }

watchState('tasks', () => {
  void showProgress()
})

watchState('isSetup', () => {
  if (state.isSetup) void showProgress()
})

export { progress }
