/* c8 ignore start */
import { readFile, writeFile } from 'node:fs/promises'
import { Logger } from '@shuunen/utils'
import glob from 'tiny-glob'

const gitIgnore = await readFile('.gitignore', 'utf8')
const ignored = gitIgnore
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .filter(line => !line.includes('*'))

function isNotIgnored(file) {
  return !ignored.some(string => file.includes(string))
}

function removeEslintComments(content) {
  // Remove single-line eslint comments
  let updated = content.replace(/\s*\/\/\s*eslint-.*$/gm, '')
  // Remove block eslint comments
  updated = updated.replace(/\/\*\s*eslint-[^*]*\*\//gm, '')
  return updated
}

const logger = new Logger()
const allFiles = await glob('**/*.{js,ts,jsx,tsx}', { filesOnly: true })
const files = allFiles.filter(isNotIgnored)
let nbFix = 0
logger.info(`Scan ${files.length} files`)

await Promise.all(
  files.map(async file => {
    // logger.info(`Checking ${file}`)
    const original = await readFile(file, 'utf8')
    const cleaned = removeEslintComments(original)
    if (cleaned !== original) {
      nbFix += 1
      await writeFile(file, cleaned, 'utf8')
      logger.info(`Updated ${file}`)
    }
  }),
)

if (nbFix === 0) logger.info(`No files updated`)
else logger.success(`Updated ${nbFix} files`)
