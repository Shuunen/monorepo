/* c8 ignore start */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import glob from 'tiny-glob'

/**
 * List entries in lib folder into the barrel index.ts file
 * @returns {Promise<void>}
 */
export async function listEntries() {
  const lib = path.join(import.meta.dirname, 'lib')
  const index = path.join(import.meta.dirname, 'index.ts')
  console.log('Listing entries in lib folder..., target :', lib)
  const files = await glob('*.ts', { cwd: lib, filesOnly: true })
  const list = files.filter(file => !file.includes('.test.ts')).map(file => `export ${file.includes('types') ? 'type ' : ''}* from './lib/${file.replace('.ts', '.js')}'`)
  const content = `${list.sort().join('\n')}\n`
  writeFileSync(index, content)
  console.log(`${index} has been updated !`)
}

/* c8 ignore start */
// avoid running this script if it's imported for testing
if (process.argv[1]?.includes('list.cli.ts')) await listEntries()
