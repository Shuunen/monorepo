import { execSync } from 'node:child_process'
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

const logger = new Logger()

type InjectMarkInAssetParams = {
  asset: { source: string; code: string }
  fileName: string
  mark: string
  placeholder: string
}

function injectMarkInAsset({ asset, fileName, mark, placeholder }: InjectMarkInAssetParams) {
  logger.debug(`Checking ${fileName}... hasAsset: ${!!asset}, typeof source: ${typeof asset.source}, typeof code: ${typeof asset.code}`)
  const firstLine = fileName.endsWith('.html') ? '' : `/* ${placeholder} : ${mark} */\n`
  const contentKey = fileName.endsWith('.js') ? 'code' : 'source'
  const injected = `${firstLine}${injectMark(asset[contentKey], placeholder, mark)}`
  asset[contentKey] = injected
  logger.debug(`Mark injected into ${fileName}`)
}

type Assets = Record<string, InjectMarkInAssetParams['asset']>

function injectMarkInAssets(assets: Assets, placeholder: string) {
  const mark = generateMark({})
  logger.info('Injecting unique mark into HTML, JS, and CSS files...')
  const targets = Object.keys(assets).filter(fileName => fileName.endsWith('.html') || fileName.endsWith('.js') || fileName.endsWith('.css'))
  for (const fileName of targets) injectMarkInAsset({ asset: assets[fileName], fileName, mark, placeholder })
  logger.success(`Mark potentially injected into ${targets.length} files`)
}

export function uniqueMark(options: { placeholder?: string } = {}): Plugin {
  const placeholder = options.placeholder || 'unique-mark'
  return {
    apply: 'build' as const,
    enforce: 'post' as const,
    generateBundle(_, bundle) {
      injectMarkInAssets(bundle as unknown as Assets, placeholder)
    },
    name: 'vite-plugin-unique-mark' as const,
  }
}
