/* c8 ignore start */
import { gray, green, red, yellow } from '@shuunen/shuutils'
import { backupPath, files } from './files.node.js'
import { copy, filename, logger, normalizePathWithSlash } from './utils.node.js'

const isDryRun = process.argv.includes('--dry')
const isSetup = process.argv.includes('--setup')
const isDebug = process.argv.includes('--debug')
const relativeBackupPath = normalizePathWithSlash(backupPath)
  .replace(normalizePathWithSlash(process.env.PWD ?? '').replace('/c/', 'C:/'), '')
  .slice(1)

/**
 * @type {import('./types.js').Report}
 */
const report = { errors: [], infos: [], success: [], suggestions: [], warnings: [] }

/**
 * Synchronize a file
 * @param {import('./types.js').File} file the file to synchronize
 * @returns {Promise<number>} the number of things you have to do in Life
 */
async function sync(file) {
  process.stdout.write('.')
  const { areEquals, destination, source } = file
  if (!source.isExisting) {
    if (!isSetup) return report.infos.push(`source file does not exists : ${source.filepath}`)
    if (isDryRun) return report.infos.push(`would copy ${filename(destination.filepath)} to ${source.filepath}`)
    const isSuccess = await copy(destination.filepath, source.filepath)
    if (isSuccess) return report.success.push(`file setup : ${source.filepath}`)
    return report.errors.push(`failed at copying : ${destination.filepath}`)
  }
  if (!destination.isExisting) {
    if (isDryRun) return report.infos.push(`would copy ${source.filepath} to ${destination.filepath}`)
    const isSuccess = await copy(source.filepath, destination.filepath)
    if (isSuccess) return report.success.push(`sync done : ${source.filepath}`)
    return report.errors.push(`failed at copying : ${source.filepath}`)
  }
  if (areEquals) return report.success.push(`sync is up to date : ${source.filepath}`)
  report.infos.push(`file should be sync manually : ${source.filepath}`)
  return report.suggestions.push(`merge ${relativeBackupPath}/${filename(destination.filepath)} ${normalizePathWithSlash(source.filepath, true)}`)
}

/**
 *
 */
async function start() {
  process.stdout.write('\nSyncing')
  await Promise.all(files.map(file => sync(file)))
  for (const error of report.errors) logger.error(red(error))
  for (const warning of report.warnings) logger.warn(yellow(warning))
  if (isDebug) for (const info of report.infos) logger.info(info)
  if (isDebug) for (const success of report.success) logger.info(green(success))
  if (report.suggestions.length > 0) logger.info('\n TODO :\n=====\n1. review changes on this repo if any\n2. run these to compare backup & local files :\n\n', report.suggestions.join('\n '), '\n', gray('tip : you can check the configs/changes folder to see the cleaned changes'))
  else logger.info(green('\n\nSync done, no actions required :)'))
}

start().catch(error => {
  logger.error(error)
})
