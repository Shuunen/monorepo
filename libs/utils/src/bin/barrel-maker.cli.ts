import { writeFileSync } from 'node:fs'
import path from 'node:path'
import glob from 'tiny-glob'
import { Logger } from '../lib/logger.js'
import { Result } from '../lib/result.js'

/* c8 ignore next */
const logger = new Logger({ minimumLevel: import.meta.main ? '3-info' : '7-error' })
const doubleDashRegex = /^--/
const ARG_START_INDEX = 2

/**
 * Creates a barrel file (index.ts) exporting all modules matching the target glob
 * @param {string} target - glob pattern for files to include
 * @param {string} index - output index file name
 * @param {string} avoid - substring to avoid in file names
 * @param {string} ext - extension for output imports (optional)
 * @returns {Promise<Result<{content: string; out: string}, string>>} - Result object with content and out on success, or error message on failure
 * @example bun barrel-maker.cli.ts --target="./lib/*.ts" --avoid=".test.ts" --ext=".js"
 */
export async function make({ target, index = 'index.ts', avoid = 'azerty-foobar', ext }: { target: string; index?: string; avoid?: string; ext?: string }) {
  const out = path.join(process.cwd(), index)
  logger.info('Listing entries', target)
  const files = await glob(target, { filesOnly: true })
  const list = files.filter(file => !file.includes(avoid)).map(file => `export ${file.includes('types') ? 'type ' : ''}* from './${ext === undefined ? file : file.split('.')[0] + ext}'`.replace(path.sep, '/'))
  const content = `${list.toSorted().join('\n')}\n`
  writeFileSync(out, content)
  logger.success(`${out} has been updated !`)
  return Result.ok({ content, files, out })
}

export async function main(argv: string[]) {
  logger.debug('barrel-maker.cli.ts started')
  const args = Object.fromEntries(argv.slice(ARG_START_INDEX).map(arg => arg.replace(doubleDashRegex, '').split('=')))
  if (!args.target) return Result.error('missing target argument')
  const options = { avoid: args.avoid, ext: args.ext, index: args.index, target: args.target }
  logger.debug('options', options)
  return await make(options)
}

/* c8 ignore start */
if (import.meta.main)
  // oxlint-disable-next-line prefer-top-level-await
  void main(process.argv)
