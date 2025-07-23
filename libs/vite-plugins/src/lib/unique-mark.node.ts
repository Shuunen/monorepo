import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Inject a mark in a string at a specific placeholder locations like
 * `__placeholder__` or `<div id="placeholder">...</div>` or `<meta name="placeholder" content="..." />`
 * @param content the string to inject the mark in
 * @param placeholder the placeholder to replace
 * @param mark the mark to inject
 * @returns the new string with the mark injected
 */
export function injectMark(content: string, placeholder: string, mark: string) {
  return content
    .replace(new RegExp(`__${placeholder}__`, 'gu'), mark)
    .replace(new RegExp(`{{1,2} ?${placeholder} ?}{1,2}`, 'g'), mark)
    .replace(new RegExp(`(<[a-z]+ .*id="${placeholder}"[^>]*>)[^<]*(</[a-z]+>)`, 'u'), `$1${mark}$2`)
    .replace(new RegExp(`(<meta name="${placeholder}" content=")[^"]*(")`, 'u'), `$1${mark}$2`)
    .replace(new RegExp(`(<meta content=")[^"]*(") name="${placeholder}"`, 'u'), `$1${mark}$2`)
}

/**
 * Generate the mark to inject
 * @param root0 the options
 * @param root0.commit the commit hash to use, if empty, will use the last git commit hash
 * @param root0.date the date to use, if empty, will use the current date
 * @param root0.version the version to use, if empty, will use the version from package.json
 * @returns the mark to inject, like "4.2.0 - 123abc45 - 01/01/2021 12:00:00"
 */
export function generateMark({ commit = '', date = new Date().toISOString(), version = '' }: Readonly<{ commit?: string; date?: string; version?: string }>) {
  let finalCommit = commit
  /* c8 ignore next */
  if (commit === '') finalCommit = execSync('git rev-parse --short HEAD', { cwd: process.cwd() }).toString().trim()
  return `${version} - ${finalCommit} - ${date}`
}

type InjectMarkInAssetParams = {
  asset: { source: string; code: string }
  fileName: string
  mark: string
  placeholder: string
}

export function injectMarkInAsset({ asset, fileName, mark, placeholder }: InjectMarkInAssetParams) {
  // console.log(`Checking ${fileName}... hasAsset: ${!!asset}, typeof source: ${typeof asset.source}, typeof code: ${typeof asset.code}`)
  const firstLine = fileName.endsWith('.html') ? '' : `/* ${placeholder} : ${mark} */\n`
  const contentKey = fileName.endsWith('.js') ? 'code' : 'source'
  const injected = `${firstLine}${injectMark(asset[contentKey], placeholder, mark)}`
  asset[contentKey] = injected
  // console.log(`Mark injected into ${fileName}`)
}

type Assets = Record<string, InjectMarkInAssetParams['asset']>

export function injectMarkInAssets(assets: Assets, placeholder: string, version: string) {
  const mark = generateMark({ version })
  console.log('Injecting unique mark into HTML, JS, and CSS files...')
  const targets = Object.keys(assets).filter(fileName => fileName.endsWith('.html') || fileName.endsWith('.js') || fileName.endsWith('.css'))
  for (const fileName of targets) injectMarkInAsset({ asset: assets[fileName], fileName, mark, placeholder })
  console.log(`Mark potentially injected into ${targets.length} files`)
}

export function getProjectVersion(projectRoot: string) {
  try {
    const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
    /* c8 ignore next */
    return pkg.version || ''
  } catch (error) {
    console.error('Could not read project package.json for version', error)
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
    generateBundle(_options, bundle) {
      injectMarkInAssets(bundle as unknown as Assets, placeholder, projectVersion)
    },
    name: 'vite-plugin-unique-mark' as const,
  }
}
