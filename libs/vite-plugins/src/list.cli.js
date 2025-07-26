/* c8 ignore start */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import glob from 'tiny-glob'

/**
 * List entries in lib folder into the barrel index.js file
 * @returns {Promise<void>}
 */
export async function listEntries() {
  const lib = path.join(import.meta.dirname, 'lib')
  const index = path.join(import.meta.dirname, 'index.js')
  console.log('Listing entries in', lib)
  const files = await glob('*.js', { cwd: lib, filesOnly: true })
  const list = files.filter(file => !file.includes('.test.js')).map(file => `export ${file.includes('types') ? 'type ' : ''}* from './lib/${file}'`)
  const content = `${list.sort().join('\n')}\n`
  writeFileSync(index, content)
  console.log(`${index} has been updated !`)
}

/* c8 ignore start */
// avoid running this script if it's imported for testing
if (process.argv[1]?.includes('list.cli.js')) await listEntries()
