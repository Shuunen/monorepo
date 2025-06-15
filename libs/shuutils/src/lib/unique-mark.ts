// biome-ignore lint/correctness/noNodejsModules: it's ok here
import { execSync } from 'node:child_process'
// biome-ignore lint/correctness/noNodejsModules: it's ok here
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
// biome-ignore lint/correctness/noNodejsModules: it's ok here
import path from 'node:path'
import glob from 'tiny-glob'
import { nbThird } from './constants.js'
import { formatDate } from './dates.js'
import { isTestEnvironment } from './environment.js'
import { parseJson } from './json.js'
import { Logger } from './logger.js'
import { Result } from './result.js'
import { injectMark } from './strings.js'
import type { PackageJson } from './types.js'

/**
 * Load the package.json file data
 * @param location the location of the package.json file
 * @returns the package.json version
 */
export function getPackageJsonVersion(location = path.join(process.cwd(), 'package.json')) {
  if (!existsSync(location)) return Result.error(`package.json was not found in ${location}, aborting.`)
  const content = readFileSync(location, 'utf8')
  const { error, value } = Result.unwrap(parseJson<PackageJson>(content))
  if (error) return Result.error(`package.json in ${location} is not a valid JSON (error : ${error}), aborting.`)
  return Result.ok(value.version)
}

/**
 * Get the files to inject the mark in
 * @param target the glob to get the files from, like "public/index.html" or "public/*.js"
 * @returns the files to inject the mark in
 */
export async function getTargetFiles(target = process.argv[nbThird] ?? '') {
  if (target === '') return Result.error('no target specified, aborting.')
  // if ends with something like *.js
  // biome-ignore lint/performance/useTopLevelRegex: <explanation>
  const extension = /\.(?<ext>[a-z]+)$/u.exec(target)?.groups?.ext ?? ''
  if (extension !== '') return Result.error(`provided : "${target}", you need to use *.{${extension}} to capture all files with that extension (limitation of tiny-glob)`)
  const files = await glob(target)
  if (files.length === 0) return Result.error(`no file found for target "${target}", aborting.`)
  return Result.ok(files)
}

/**
 * Generate the mark to inject
 * @param root0 the options
 * @param root0.commit the commit hash to use, if empty, will use the last git commit hash
 * @param root0.date the date to use, if empty, will use the current date
 * @param root0.version the version to use, if empty, will use the version from package.json
 * @returns the mark to inject, like "4.2.0 - 123abc45 - 01/01/2021 12:00:00"
 */
export function generateMark({ commit = '', date = formatDate(new Date(), 'dd/MM/yyyy HH:mm:ss'), version = '' }: Readonly<{ commit?: string; date?: string; version?: string }>) {
  let finalCommit = commit
  if (commit === '') finalCommit = execSync('git rev-parse --short HEAD', { cwd: process.cwd() }).toString().trim()
  return `${version} - ${finalCommit} - ${date}`
}

/**
 * Inject the mark in the files
 * @param root0 the options
 * @param root0.placeholder the placeholder to use to inject the mark
 * @param root0.mark the mark to inject
 * @param root0.files the files to inject the mark in
 * @param root0.isReadOnly if true, will not write the files to disk (useful for unit tests)
 * @returns the total amount of mark injection in the targeted files
 */
// oxlint-disable-next-line max-lines-per-function
export function injectMarkInFiles({ files = [], isReadOnly = false, mark = 'no-mark', placeholder = 'unique-mark' }: Readonly<{ files?: readonly string[]; isReadOnly?: boolean; mark?: string; placeholder?: string }>) {
  let totalInjections = 0
  const logs: string[] = []
  const markRegex = new RegExp(mark, 'gu')
  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    if (!content.includes(placeholder) && files.length === 1) return Result.error(`could not find a place to inject in ${file}, aborting.\n\nPlease use one or more of these placeholders :  <span id="${placeholder}"></span>  <meta name="${placeholder}" content="">  __${placeholder}__`)
    const updatedContent = injectMark(content, placeholder, mark)
    const times = updatedContent.match(markRegex)?.length ?? 0
    if (!isReadOnly) writeFileSync(file, updatedContent)
    logs.push(`injected in ${file} : ${times} time${times > 1 ? 's' : ''}`)
    totalInjections += times
  }
  return Result.ok({ logs, totalInjections })
}

/**
 * Main function
 * @param target the glob to get the files from, like "public/index.html" or "public/*.js"
 * @returns a Result object
 */
export async function init(target = process.argv[nbThird] ?? '') {
  const logger = new Logger()
  logger.debug('starting...')
  const version = getPackageJsonVersion()
  if (!version.ok) throw new Error(version.error)
  const files = await getTargetFiles(target)
  if (!files.ok) throw new Error(files.error)
  logger.debug(`found ${files.value.length} file${files.value.length > 1 ? 's' : ''} to inject mark :`, files.value.join(', '))
  const mark = generateMark({ version: version.value })
  logger.debug('generated mark', mark)
  const result = injectMarkInFiles({ files: files.value, mark })
  if (!result.ok) throw new Error(result.error)
  const { logs, totalInjections } = result.value
  for (const line of logs) logger.info(...(line.split(':') as [string, string]))
  if (totalInjections === 0) logger.info('files found but no mark found for injection')
  else logger.success('total injections :', String(totalInjections))
  return Result.ok(`injected ${totalInjections} mark${totalInjections > 1 ? 's' : ''} in ${files.value.length} file${files.value.length > 1 ? 's' : ''}`)
}

/* c8 ignore next */
if (!isTestEnvironment()) init()
