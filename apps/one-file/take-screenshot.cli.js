/* c8 ignore start */
// oxlint-disable no-await-in-loop
import { exec } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'
import { Logger, nbFourth, nbSecondsInMinute, nbThird } from '@shuunen/shuutils'
import { getFfmpegCommand, getScreenshotFilename, parseUserInput, parseVideoMetadata } from './take-screenshot.utils.js'

/**
 * @typedef {import('./take-screenshot.types').Metadata} Metadata
 * @typedef {import('./take-screenshot.types').Task} Task
 */

const currentFolder = import.meta.dirname
const logFile = path.join(currentFolder, 'take-screenshot.log')
const lastInputFile = path.join(currentFolder, 'take-screenshot-last-input.txt')
const logger = new Logger()

/**
 *
 */
async function logClear() {
  await fs.writeFile(logFile, '')
}

/**
 * @param  {Date[] | string[]} stuff things to add to the log
 */
async function logAdd(...stuff) {
  await fs.appendFile(logFile, `${stuff.join(' ')}\n`)
}

/**
 * @param {string} cmd shell command to execute
 * @returns {Promise<string>} the output of the command
 */
function shellCommand(cmd) {
  return new Promise(resolve => {
    // oxlint-disable-next-line max-nested-callbacks
    exec(cmd, (error, stdout, stderr) => {
      if (error) logger.error(error)
      resolve(stdout || stderr)
    })
  })
}

/**
 * @param {string} filePath the path of the file to delete
 */
async function deleteFile(filePath) {
  await fs.unlink(filePath).catch(() => 'ok')
}

/**
 * @param {string} filePath the path of the file to get the size of
 * @returns {Promise<number>} the size of the file in bytes
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath)
  return stats.size
}

/**
 * @param {string} filePath the path of the file to get the duration of
 * @returns {Promise<Metadata>} the metadata of the video file
 */
async function getVideoMetadata(filePath) {
  const output = await shellCommand(`ffprobe -show_format -show_streams -print_format json -v quiet -i "${filePath}" `)
  if (!output.startsWith('{')) throw new Error(`ffprobe output should be JSON but got :${output}`)
  const data = JSON.parse(output)
  const metadata = parseVideoMetadata(data)
  if (metadata.size === 0) metadata.size = await getFileSize(filePath)
  metadata.filepath = filePath
  return metadata
}

/**
 * @param {number} totalSeconds the total seconds to take the screenshot at
 * @param {Metadata} metadata the metadata of the video file
 * @returns {Task} task object containing the screenPath, totalSeconds and videoPath
 */
function getTask(totalSeconds, metadata) {
  if (metadata.filepath === undefined) throw new Error('missing filepath')
  const screenName = getScreenshotFilename(totalSeconds, metadata)

  const screenPath = path.join(process.env.HOME ?? process.env.USERPROFILE ?? '', 'Pictures', screenName)
  return { screenPath, totalSeconds, videoPath: metadata.filepath }
}

/**
 * @param {string} input the user input
 * @returns {Promise<Task[]>} an array of tasks to take screenshots at the specified times
 */
async function getTasks(input) {
  const videoPath = process.argv[nbThird]
  if (videoPath === undefined) throw new Error('no video path')
  const videoName = path.basename(videoPath)
  const meta = await getVideoMetadata(videoPath)
  if (meta.title.length <= videoName.length) meta.title = videoName
  await logAdd(`\n- videoPath : ${videoPath}\n- videoName : ${videoName}\n- title : ${meta.title}`)
  const targetsTotalSeconds = parseUserInput(input).map(({ minutes, seconds }) => minutes * nbSecondsInMinute + seconds)
  return targetsTotalSeconds.map(totalSeconds => getTask(totalSeconds, meta))
}

/**
 * @param {string} input the user input
 */
async function takeScreenAt(input) {
  await logAdd(`Input : "${input}"`)
  if (input) fs.writeFile(lastInputFile, input)
  const tasks = await getTasks(input)
  await logAdd(`Tasks prepared : ${tasks.length}`)
  for (const task of tasks) {
    const cmd = getFfmpegCommand(task)
    await deleteFile(task.screenPath)
    await logAdd('Command :', cmd)
    await logAdd(await shellCommand(cmd))
  }
}

/**
 *
 */
async function init() {
  logger.info('\nTake screenshot is starting !\n')
  await logClear()
  await logAdd('Take screenshot starts @', new Date().toISOString())
  if (process.argv[nbThird] === undefined) throw new Error('missing videoPath')
  if (process.argv[nbFourth]) {
    await takeScreenAt(process.argv[nbFourth])
    return
  }
  const lastInput = await fs.readFile(lastInputFile, 'utf8').catch(() => '60')
  await logAdd('Last input :', lastInput)
  const ask = createInterface({ input: process.stdin, output: process.stdout })
  ask.question(`  Please type the time in mmss or ss (enter to use "${lastInput}") : `, async time => {
    await takeScreenAt(time || lastInput)
    ask.close() // close the readline interface to allow the process to exit
  })
}

await init().catch(async error => {
  await logAdd(`Init global error : ${error}`)
})
