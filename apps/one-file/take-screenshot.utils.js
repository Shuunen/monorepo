import { nbMsInSecond, nbSecondsInMinute } from '@shuunen/shuutils'

/**
 * @typedef {import('./take-screenshot.types').FfProbeOutput} FfProbeOutput
 * @typedef {import('./take-screenshot.types').Metadata} Metadata
 * @typedef {import('./take-screenshot.types').Target} Target
 * @typedef {import('./take-screenshot.types').Task} Task
 */

export const /** @type {Metadata} */ emptyMetadata = { duration: 0, height: 0, size: 0, title: '' }

const regex = {
  userInput: /^(?<minutesOrSeconds>\d{1,2})(?<secondsMaybe>\d{0,2})(?<moduloMarker>[+-]*)(?<moduloMaybe>\d{0,2})$/u,
}

/**
 * @param {Partial<FfProbeOutput>?} ffProbeOutput output from ffprobe
 * @returns {Metadata} parsed metadata with duration, height, size and title
 */
export function parseVideoMetadata(ffProbeOutput) {
  if (ffProbeOutput?.streams === undefined || ffProbeOutput.streams.length === 0) return emptyMetadata
  const video = ffProbeOutput.streams.find(stream => stream.codec_type === 'video')
  if (!video) return emptyMetadata
  const { height } = video
  const media = ffProbeOutput.format
  const duration = media?.duration ?? 0
  const title = media?.tags?.title ?? ''
  const size = media?.size ?? 0
  return { duration, height, size, title }
}

/**
 * @param {number} modulo in seconds
 * @param {number} minutesBase in minutes
 * @param {number} secondsBase in seconds
 * @returns {Target[]} targets with minutes and seconds
 */
export function getTargets(modulo, minutesBase, secondsBase) {
  const targets = []
  let seconds = 0
  let minutes = minutesBase
  for (let step = -modulo; step <= modulo; step += 1) {
    seconds = secondsBase + step
    if (seconds < 0) {
      minutes = minutesBase - 1
      seconds += nbSecondsInMinute
    } else if (seconds > nbSecondsInMinute - 1) {
      minutes = minutesBase + 1
      seconds -= nbSecondsInMinute
    }
    targets.push({ minutes, seconds })
    if (seconds === nbSecondsInMinute - 1) minutes += 1
  }
  return targets
}

/**
 * Parse user input to extract the targeted time(s)
 * @param {string} userInput string like "12", "12+-1" or "2106+-2"
 * @returns {Target[]} like [{ minutes: 0, seconds: 12 }], [{minutes: 0, seconds: 11}, {minutes: 0, seconds: 12}, {minutes: 0, seconds: 13}] or [{minutes: 21, seconds: 4}, {minutes: 21, seconds: 5}, {minutes: 21, seconds: 6},{minutes: 21, seconds: 7}, {minutes: 21, seconds: 8}]
 */
export function parseUserInput(userInput) {
  const { minutesOrSeconds = '', moduloMarker = '', moduloMaybe = '', secondsMaybe = '' } = regex.userInput.exec(userInput)?.groups ?? {}
  if (minutesOrSeconds === '') return []
  const secondsBase = Number.parseInt(secondsMaybe || minutesOrSeconds, 10)
  const minutesBase = secondsMaybe === '' ? 0 : Number.parseInt(minutesOrSeconds, 10)
  // oxlint-disable-next-line no-nested-ternary, no-magic-numbers
  const modulo = moduloMaybe === '' ? (moduloMarker === '' ? 0 : 5) : Number.parseInt(moduloMaybe.replace(/\D/gu, ''), 10)
  return getTargets(modulo, minutesBase, secondsBase)
}

/**
 * @param {number} seconds in seconds
 * @returns {string} readable duration like "00h00m12s"
 */
export function readableDuration(seconds) {
  // oxlint-disable-next-line no-magic-numbers
  return `${new Date(seconds * nbMsInSecond).toISOString().slice(11, 19).replace(':', 'h').replace(':', 'm')}s`
}

/**
 * @param {number} size in bytes
 * @returns {string} readable size like "1,2go" or "123mo"
 */
export function readableSize(size) {
  let unit = 'go'
  const bytes = 1024
  let nb = (size / bytes / bytes / bytes).toFixed(1)
  if (nb.startsWith('0')) {
    unit = 'mo'
    nb = String(Math.round(size / bytes / bytes))
  }
  return nb.replace('.', ',') + unit
}

/**
 * @param {number} totalSeconds in seconds
 * @param {Metadata} metadata metadata
 * @returns {string} screenshot filename
 */
export function getScreenshotFilename(totalSeconds, metadata) {
  const { duration, height, size, title } = metadata
  const screenName = `${[title.replace(/\./gu, ' '), readableDuration(totalSeconds), readableSize(size), `${height}p`, readableDuration(duration)].join(' ').trim()}.jpg`

  // replace un-authorized characters in filename
  return screenName.replace(/\s?["*/:<>?\\|]+\s?/gu, ' ').replace(/\s+/gu, ' ')
}

/**
 * @param {Task} task task with screenPath, totalSeconds and videoPath
 * @returns {string} ffmpeg command to take a screenshot
 */
export function getFfmpegCommand(task) {
  const { screenPath, totalSeconds, videoPath } = task
  return `ffmpeg -ss ${totalSeconds} -i "${videoPath}" -frames:v 1 -q:v 1 "${screenPath}"`
}
