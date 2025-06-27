import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { formatDate, injectMark, Logger } from '@shuunen/shuutils'
import type { Plugin } from 'vite'

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
  /* c8 ignore next */
  if (commit === '') finalCommit = execSync('git rev-parse --short HEAD', { cwd: process.cwd() }).toString().trim()
  return `${version} - ${finalCommit} - ${date}`
}

/* c8 ignore start */

/**
 * Injects a unique mark into a file
 * @param placeholder - The string placeholder in the HTML file where the unique mark should be injected, like "unique-mark", "foo-bar", etc.
 */
export function injectMarkInFile(placeholder: string) {
  const logger = new Logger()
  const distPath = path.resolve(process.cwd(), 'dist', 'index.html')
  const html = readFileSync(distPath, 'utf8')
  if (!html) {
    logger.error('No HTML file found in dist directory')
    return
  }
  const mark = generateMark({})
  const newHtml = injectMark(html, placeholder, mark)
  writeFileSync(distPath, newHtml)
  logger.success(`Mark injected into HTML file: ${distPath}`)
}

/**
 * Vite plugin to inject unique mark into built HTML files
 * @param options - Plugin optionsAdd commentMore actions
 * @param options.placeholder - Placeholder string to replace in HTML
 * @returns The Vite plugin object
 */
// oxlint-disable-next-line max-lines-per-function
export function uniqueMark(options: { placeholder?: string } = {}): Plugin {
  const placeholder = options.placeholder || 'unique-mark'
  return {
    apply: 'build',
    closeBundle() {
      injectMarkInFile(placeholder)
    },
    enforce: 'post',
    name: 'vite-plugin-unique-mark',
  }
}
