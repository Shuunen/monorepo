import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

const logger = new Logger()

type InjectMarkInAssetParams = {
  asset: { source: string; code: string }
  fileName: string
  mark: string
  placeholder: string
}

export function injectMarkInAsset({ asset, fileName, mark, placeholder }: InjectMarkInAssetParams) {
  logger.debug(`Checking ${fileName}... hasAsset: ${!!asset}, typeof source: ${typeof asset.source}, typeof code: ${typeof asset.code}`)
  const firstLine = fileName.endsWith('.html') ? '' : `/* ${placeholder} : ${mark} */\n`
  const contentKey = fileName.endsWith('.js') ? 'code' : 'source'
  const injected = `${firstLine}${injectMark(asset[contentKey], placeholder, mark)}`
  asset[contentKey] = injected
  logger.debug(`Mark injected into ${fileName}`)
}

type Assets = Record<string, InjectMarkInAssetParams['asset']>

export function injectMarkInAssets(assets: Assets, placeholder: string, version: string) {
  const mark = generateMark({ version })
  logger.info('Injecting unique mark into HTML, JS, and CSS files...')
  const targets = Object.keys(assets).filter(fileName => fileName.endsWith('.html') || fileName.endsWith('.js') || fileName.endsWith('.css'))
  for (const fileName of targets) injectMarkInAsset({ asset: assets[fileName], fileName, mark, placeholder })
  logger.success(`Mark potentially injected into ${targets.length} files`)
}

export function getProjectVersion(projectRoot: string) {
  try {
    const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
    /* c8 ignore next */
    return pkg.version || ''
  } catch (error) {
    logger.warn('Could not read project package.json for version', error)
    return ''
  }
}

export function uniqueMark(options: { placeholder?: string } = {}): Plugin {
  const placeholder = options.placeholder || 'unique-mark'
  let projectRoot = ''
  let projectVersion = ''
  return {
    apply: 'build' as const,
    configResolved(config) {
      projectRoot = config.root
      projectVersion = getProjectVersion(projectRoot)
    },
    enforce: 'post' as const,
    generateBundle(_, bundle) {
      injectMarkInAssets(bundle as unknown as Assets, placeholder, projectVersion)
    },
    name: 'vite-plugin-unique-mark' as const,
  }
}
