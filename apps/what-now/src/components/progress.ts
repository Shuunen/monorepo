// oxlint-disable no-magic-numbers
import { debounce, dom, fetchJson, fetchRaw, nbPercentMax, throttle, tw } from '@shuunen/shuutils'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'
import { isTaskActive, minutesRemaining } from '../utils/tasks.utils'

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

async function emitToHue(percent = 0) {
  const options = {
    body: `progress=${percent}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    mode: 'no-cors',
  } as const
  const result = await fetchRaw(state.hueEndpoint, options)
  logger.info('hue response', result)
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

async function emitToTrmnlSync(progress = 0) {
  const activeTasks = state.tasks.filter(task => isTaskActive(task))
  const payload = {
    // biome-ignore lint/style/useNamingConvention: that's what trmnl webhook expects
    merge_variables: {
      nextSubtitle: activeTasks[0].reason,
      nextTitle: activeTasks[0].name,
      progress,
      remaining: `${minutesRemaining(activeTasks)} min to take care`,
    },
  }
  const options = {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    // mode: 'no-cors', // can't use no-cors, that will prevent us from making the correct request (it mess up the accept header and the response is failing)
  } as const
  const result = await fetchJson(state.trmnlWebhook, options)
  logger.info('trmnl response', result)
}

// Throttle to max 12 calls per hour (one call every 5 minutes = 300,000ms)
const emitToTrmnl = throttle(emitToTrmnlSync, 300_000)

function showProgressSync() {
  const total = state.tasks.length
  const remaining = state.tasks.filter(task => isTaskActive(task)).length
  const percent = nbPercentMax - Math.round((remaining / total) * nbPercentMax)
  logger.info('show progress', { percent, remaining, total })
  progress.style.width = `${percent}%`
  document.body.dataset.progress = String(percent)
  state.statusProgress = counterText(percent)
  showProgressBackground(percent)
  if (state.hueEndpoint !== '') void emitToHue(percent)
  if (state.trmnlWebhook !== '') emitToTrmnl(percent)
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
