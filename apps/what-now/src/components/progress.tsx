import { debounce, fetchJson, fetchRaw, nbHueMax, nbMsInHour, nbPercentMax, throttle } from '@monorepo/utils'
import type { Task } from '../types'
import { logger } from '../utils/logger.utils'
import { trmnlPayload } from '../utils/progress.utils'
import { state } from '../utils/state.utils'
import { isTaskActive } from '../utils/tasks.utils'

function counterText(percent = 0) {
  /* oxlint-disable no-magic-numbers */
  if (!percent) return 'Nothing done... yet'
  if (percent <= 25) return 'Amuse-bouche : check'
  if (percent <= 33) return 'Now we are talking'
  if (percent <= 50) return 'Halfway to heaven'
  if (percent <= 75) return 'Final chapter for today'
  if (percent < 100) return 'Lasts tasks remaining !'
  return 'You made it, well done dude :)'
  /* oxlint-enable no-magic-numbers */
}

async function emitToHue(percent: number) {
  const options = {
    body: `progress=${percent}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    mode: 'no-cors',
  } as const
  const result = await fetchRaw(state.hueEndpoint, options)
  logger.info('hue response', result)
}

function getProgressBackground(percent: number) {
  /* oxlint-disable no-magic-numbers */
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
  /* oxlint-enable no-magic-numbers */
}

function showProgressBackground(percent: number) {
  logger.info(`show progress background for ${percent}%`)
  const target = getProgressBackground(percent)
  document.body.className = document.body.className.replace(/from-\w+-\d+ to-\w+-\d+/giu, target)
}

async function emitToTrmnlSync(progress: number) {
  const options = {
    body: trmnlPayload(progress),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    // mode: 'no-cors', // can't use no-cors, that will prevent us from making the correct request (it mess up the accept header and the response is failing)
  } as const
  const result = await fetchJson(state.trmnlWebhook, options)
  logger.info('trmnl response', result)
}

const maxCallsPerHour = 12
const throttleDelay = Math.round(nbMsInHour / maxCallsPerHour)
const emitToTrmnl = throttle(emitToTrmnlSync, throttleDelay)

function showProgressSync(percent: number) {
  logger.info('show progress', { percent })
  document.body.dataset.progress = String(percent)
  state.statusProgress = counterText(percent)
  showProgressBackground(percent)
  if (state.hueEndpoint !== '') void emitToHue(percent)
  if (state.trmnlWebhook !== '') emitToTrmnl(percent)
}

const showProgress = debounce(showProgressSync, nbHueMax)

export function Progress({ tasks }: { tasks: Task[] }) {
  const total = tasks.length
  if (total === 0) return
  const remaining = tasks.filter(task => isTaskActive(task)).length
  const percent = nbPercentMax - Math.round((remaining / total) * nbPercentMax)
  showProgress(percent)
  return <div className="border-dashed border border-white" data-testid="progress" style={{ width: `${percent}%` }} />
}
