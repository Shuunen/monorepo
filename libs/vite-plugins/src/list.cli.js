/* c8 ignore start */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import glob from 'tiny-glob'

const options = {
  avoid: '.test.',
  ext: undefined,
  index: 'index.js',
  target: './lib/*.js',
}

/**
 * List entries in lib folder into the barrel index.js file
 * @returns {Promise<void>}
 */
export async function listEntries() {
  const index = path.join(import.meta.dirname, options.index)
  console.log('Listing entries', options.target)
  const files = await glob(options.target, { cwd: import.meta.dirname, filesOnly: true })
  const list = files.filter(file => !file.includes(options.avoid)).map(file => `export ${file.includes('types') ? 'type ' : ''}* from './${options.ext === undefined ? file : file.split('.')[0] + options.ext}'`.replace(path.sep, '/'))
  const content = `${list.sort().join('\n')}\n`
  writeFileSync(index, content)
  console.log(`${index} has been updated !`)
}

/* c8 ignore start */
// avoid running this script if it's imported for testing
if (process.argv[1]?.includes('list.cli.js')) await listEntries()
