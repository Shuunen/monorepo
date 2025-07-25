// biome-ignore lint/correctness/noNodejsModules: ok here
import { readFileSync, statSync } from 'node:fs'
// biome-ignore lint/correctness/noNodejsModules: ok here
import path from 'node:path'
import { Logger } from '@shuunen/shuutils'

export const logger = new Logger()

/**
 * Replace a placeholder in a string and check if it was replaced
 * @param {string} string The string to replace in
 * @param {RegExp} regex The regex to replace
 * @param {string} replacement The replacement
 * @returns The replaced string
 * @example replaceAndCheck('Hello world !', /world/gu, 'there') // 'Hello there !'
 */
export function replaceAndCheck(string, regex, replacement) {
  const replaced = string.replace(regex, `$<before>${replacement}$<after>`)
  if (replaced === string) logger.error(`Could not replace ${String(regex)} with ${replacement}`)
  return replaced
}

/**
 * Replace a placeholder in a string and check if it was replaced via an identifier
 * @param {string} string The string to replace in
 * @param {string} id The identifier to replace
 * @param {string} replacement The replacement
 * @returns The replaced string
 */
export function replaceAndCheckById(string, id, replacement) {
  const regex = new RegExp(`(?<before>id="${id}"[^>]+>)(?<content>[^<]+)(?<after></)`, 'gu')
  return replaceAndCheck(string, regex, replacement)
}

/**
 * File reading
 * @param {string} relativeFilepath The relative path to the file
 * @param folderPath the folder path
 * @returns The file content
 */
// oxlint-disable-next-line no-undef
export function safeRead(relativeFilepath, folderPath = process.cwd()) {
  const filepath = path.join(folderPath, relativeFilepath)
  const stats = statSync(filepath, { throwIfNoEntry: false })
  if (stats === undefined) {
    logger.warn('Failed to get stats for', filepath)
    return ''
  }
  if (stats.isDirectory()) {
    logger.warn('The file', filepath, 'is a directory, will not be used')
    return ''
  }
  return readFileSync(filepath, 'utf8')
}

const regex = {
  color: /#(?:[\da-f]{3}){1,2}/iu,
  description: /"description": "(?<description>[^"]+)"/u,
  packageName: /"name": "(?<name>[^"]+)"/u,
  scopeAndName: /\.com\/(?<scope>[^/]+)\/(?<name>[\w-]+)/iu,
}

/**
 * Extract data
 * @param folderPath the folder to extract data from
 * @returns {Object} the extracted data with color, description, name, and scope
 */
// oxlint-disable-next-line no-undef
export function extractData(folderPath = process.cwd()) {
  const defaults = { color: '#024eb8', description: 'A placeholder description', name: 'unknown', scope: 'JohnDoe' }
  const infos = [safeRead('.vscode/settings.json', folderPath), safeRead('package.json', folderPath)].join('\n')
  const packageName = regex.packageName.exec(infos)?.groups?.name?.split('/')?.toReversed?.()[0]
  const scopeAndName = regex.scopeAndName.exec(infos)?.groups
  const name = packageName ?? /* c8 ignore next */ scopeAndName?.name ?? defaults.name
  const scope = scopeAndName?.scope ?? defaults.scope
  if (name === defaults.name) logger.error('Could not find a name for the project, using the default one :', name)
  const description = regex.description.exec(infos)?.groups?.description ?? defaults.description
  if (description === defaults.description) logger.error('Could not find a description for the project, using the default one :', description)
  const color = regex.color.exec(infos)?.[0] ?? defaults.color
  if (color === defaults.color) logger.warn('Could not find a color for the project, using the default one :', color)
  return { color, description, name, scope }
}
