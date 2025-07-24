import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Inject a mark in a string at a specific placeholder locations like
 * `__placeholder__` or `<div id="placeholder">...</div>` or `<meta name="placeholder" content="..." />`
 * @param {string} content the string to inject the mark in
 * @param {string} placeholder the placeholder to replace
 * @param {string} mark the mark to inject
 * @returns the new string with the mark injected
 */
export function injectMark(content, placeholder, mark) {
  return content
    .replace(new RegExp(`__${placeholder}__`, 'gu'), mark)
    .replace(new RegExp(`{{1,2} ?${placeholder} ?}{1,2}`, 'g'), mark)
    .replace(new RegExp(`(<[a-z]+ .*id="${placeholder}"[^>]*>)[^<]*(</[a-z]+>)`, 'u'), `$1${mark}$2`)
    .replace(new RegExp(`(<meta name="${placeholder}" content=")[^"]*(")`, 'u'), `$1${mark}$2`)
    .replace(new RegExp(`(<meta content=")[^"]*(") name="${placeholder}"`, 'u'), `$1${mark}$2`)
}

/**
 * Generate the mark to inject
 * @param {object} root0 the options
 * @param {string} [root0.commit] the commit hash to use, if empty, will use the last git commit hash
 * @param {string} [root0.date] the date to use, if empty, will use the current date
 * @param {string} [root0.version] the version to use, if empty, will use the version from package.json
 * @returns the mark to inject, like "4.2.0 - 123abc45 - 01/01/2021 12:00:00"
 */
export function generateMark({ commit = '', date = new Date().toISOString(), version = '' }) {
  let finalCommit = commit
  /* c8 ignore next */
  if (commit === '') finalCommit = execSync('git rev-parse --short HEAD', { cwd: process.cwd() }).toString().trim()
  return `${version} - ${finalCommit} - ${date}`
}

/**
 * Injects a unique mark into the provided asset's content at the specified placeholder.
 * @param {object} params - The parameters for injection.
 * @param {Record<string,string>} params.asset - The asset record containing the content to modify.
 * @param {string} params.fileName - The name of the file being processed.
 * @param {string} params.mark - The unique mark to inject.
 * @param {string} params.placeholder - The placeholder string to be replaced by the mark.
 */
export function injectMarkInAsset({ asset, fileName, mark, placeholder }) {
  // console.log(`Checking ${fileName}... hasAsset: ${!!asset}, typeof source: ${typeof asset.source}, typeof code: ${typeof asset.code}`)
  const firstLine = fileName.endsWith('.html') ? '' : `/* ${placeholder} : ${mark} */\n`
  const contentKey = fileName.endsWith('.js') ? 'code' : 'source'
  const injected = `${firstLine}${injectMark(asset[contentKey], placeholder, mark)}`
  asset[contentKey] = injected
  // console.log(`Mark injected into ${fileName}`)
}

/**
 * Injects a unique mark into specified asset files (HTML, JS, and CSS) by replacing a placeholder.
 * @param {Record<string, Record<string,string>>} assets - An object mapping file names to asset contents.
 * @param {string} placeholder - The placeholder string to be replaced with the unique mark.
 * @param {string} version - The version string to include in the generated mark.
 */
export function injectMarkInAssets(assets, placeholder, version) {
  const mark = generateMark({ version })
  console.log('Injecting unique mark into HTML, JS, and CSS files...')
  const targets = Object.keys(assets).filter(fileName => fileName.endsWith('.html') || fileName.endsWith('.js') || fileName.endsWith('.css'))
  for (const fileName of targets)
    injectMarkInAsset({
      asset: assets[fileName],
      fileName,
      mark,
      placeholder,
    })
  console.log(`Mark potentially injected into ${targets.length} files`)
}

/**
 * Retrieves the version of a project from its package.json file.
 * @param {string} projectRoot - The root directory of the project.
 * @returns {string} The version specified in package.json, or an empty string if not found or on error.
 */
export function getProjectVersion(projectRoot) {
  try {
    const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
    /* c8 ignore next */ return pkg.version || ''
  } catch (error) {
    console.error('Could not read project package.json for version', error)
    return ''
  }
}

/**
 * Vite plugin to inject a unique mark (such as a version string) into build assets.
 * @param {object} [options] - Plugin options.
 * @param {string} [options.placeholder] - Placeholder string to be replaced in assets.
 * @returns {import('vite').Plugin} Vite plugin object.
 */
export function uniqueMark(options = {}) {
  const placeholder = options.placeholder || 'unique-mark'
  let projectRoot = ''
  let projectVersion = ''
  return {
    apply: 'build',
    configResolved(config) {
      projectRoot = config.root
      projectVersion = getProjectVersion(projectRoot)
    },
    enforce: 'post',
    generateBundle(_options, bundle) {
      // @ts-expect-error type mismatch, but we know bundle is an object with string keys
      injectMarkInAssets(bundle, placeholder, projectVersion)
    },
    name: 'vite-plugin-unique-mark',
  }
}
