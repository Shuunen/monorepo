/* c8 ignore start */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { green, Logger } from '@shuunen/shuutils'
import glob from 'tiny-glob'

const options = {
  avoid: '.stories.',
  ext: '',
  index: 'index.ts',
  target: './{atoms,molecules}/*.tsx',
}

/**
 * List entries in lib folder into the barrel index.ts file
 * @returns {Promise<void>}
 */
export async function listEntries() {
  const logger = new Logger()
  const index = path.join(import.meta.dirname, options.index)
  logger.info('Listing entries', green(options.target))
  const files = await glob(options.target, { cwd: import.meta.dirname, filesOnly: true })
  const list = files.filter(file => !file.includes(options.avoid)).map(file => `export ${file.includes('types') ? 'type ' : ''}* from './${options.ext === undefined ? file : file.split('.')[0] + options.ext}'`.replace(path.sep, '/'))
  const content = `${list.sort().join('\n')}\n`
  writeFileSync(index, content)
  logger.success(`${index} has been updated !`)
}

await listEntries()
