import { writeFileSync } from 'node:fs'
import path from 'node:path'
import glob from 'tiny-glob'
import { nbThird } from '../lib/constants.js'
import { Logger } from '../lib/logger.js'
import { Result } from '../lib/result.js'

/* v8 ignore next -- @preserve */
const logger = new Logger({ minimumLevel: import.meta.main ? '3-info' : '7-error' })

/**
 * Filters out unwanted files based on naming conventions
 * @param filename the name of the file to check
 * @returns true if the file is wanted, false otherwise
 */
function filterFile(filename: string) {
  if (filename.endsWith('.d.ts')) return false
  if (filename.includes('.test.')) return false
  if (filename.includes('.stories.')) return false
  return true
}

/**
 * Creates a barrel file (index.ts) exporting all modules matching the target glob
 * @param options configuration options
 * @param options.target glob pattern for files to include
 * @param options.index output index file name
 * @param options.ext extension for output imports (optional)
 * @returns result object with content and out on success, or error message on failure
 * @example bun barrel-maker.cli.ts --target="./lib/*.ts" --ext=".js"
 */
export async function make({ target, index = 'index.ts', ext }: { target: string; index?: string; ext?: string }) {
  const out = path.join(process.cwd(), index)
  logger.info('Listing entries', target)
  const files = await glob(target, { filesOnly: true })
  const list = files.filter(file => filterFile(file)).map(file => `export ${file.includes('types') ? 'type ' : ''}* from './${ext === undefined ? file : file.split('.')[0] + ext}'`.replace(path.sep, '/'))
  const content = `${list.toSorted().join('\n')}\n`
  writeFileSync(out, content)
  logger.success(`${out} has been updated !`)
  return Result.ok({ content, files, out })
}

/**
 * Main entry point for the barrel-maker CLI
 * @param argv the command line arguments
 * @returns result object with content, files, and out on success, or error message on failure
 */
export async function main(argv: string[]) {
  logger.debug('barrel-maker.cli.ts started')
  const args = Object.fromEntries(argv.slice(nbThird).map(arg => arg.replace('--', '').split('=')))
  if (!args.target) return Result.error('missing target argument')
  const options = { ext: args.ext, index: args.index, target: args.target }
  logger.debug('options', options)
  return await make(options)
}

/* v8 ignore next 2 -- @preserve */
// oxlint-disable-next-line prefer-top-level-await
if (import.meta.main) void main(process.argv)
