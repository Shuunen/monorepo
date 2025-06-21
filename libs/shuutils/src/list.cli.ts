/* c8 ignore start */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import glob from 'tiny-glob'
import { Logger } from './lib/logger.js'

/**
 * List entries in lib folder into the barrel index.ts file
 * @returns {Promise<void>}
 */
async function listEntries() {
  const logger = new Logger()
  const lib = path.join(import.meta.dirname, 'lib')
  const index = path.join(import.meta.dirname, 'index.ts')
  logger.info('Listing entries in lib folder..., target: ', lib)
  const files = await glob('*.ts', { cwd: lib, filesOnly: true })
  const list = files.filter(file => !(file.includes('shuutils.ts') || file.includes('unique-mark.ts') || file.includes('.test.ts'))).map(file => `export ${file.includes('types') ? 'type ' : ''}* from './lib/${file.replace('.ts', '.js')}'`)
  const content = `${list.sort().join('\n')}\n`
  writeFileSync(index, content)
  logger.success(`${index} has been updated !`)
}

await listEntries()
