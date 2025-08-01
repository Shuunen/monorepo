/* c8 ignore start */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { clean, logger, useUnixCarriageReturn } from './utils.node.js'

const currentFolderPath = import.meta.dirname
const changesFolderPath = path.join(currentFolderPath, 'changes')

const home = process.env.HOME ?? ''
const appData = process.env.APPDATA ?? (process.platform === 'darwin' ? `${home}Library/Preferences` : `${home}/.config`)
const isWindows = process.env.APPDATA === appData
// const prgFiles = 'C:/Program Files'
logger.info(`Using home directory : ${home}`)
logger.info(`Using app data directory : ${appData}`)
logger.info(`Detected platform : ${isWindows ? 'Windows' : 'Linux'}, process.platform is "${process.platform}"`)

// oxlint-disable sort-keys
/** @type {import('./types.js').Config[]} */
const configs = [
  { source: `${home}/.bash_aliases` },
  { renameTo: 'vscode-keybindings.json', source: `${appData}/Code/User/keybindings.json` },
  { renameTo: 'vscode-settings.json', source: `${appData}/Code/User/settings.json` },
  // { source: `${appData}/HandBrake/presets.json`, renameTo: 'handbrake-presets.json' },
  // { source: `${appData}/HandBrake/settings.json`, renameTo: 'handbrake-settings.json' },
  { source: `${appData}/kupfer/kupfer.cfg` },
  { source: `${appData}/mpv/mpv.conf` },
  { removeLinesMatching: [/@Size/, /(Qt6|qt5)/, /(Cookies|CurrentTab|geometry|LastViewedPage|Sizes|Width)=/], source: `${appData}/qBittorrent/qBittorrent.conf` },
  { source: `${home}/.gitconfig-anatec` },
  { source: `${home}/.gitconfig-collectif-energie` },
  { source: `${home}/.gitconfig-github` },
  { source: `${home}/.gitconfig` },
  { source: `${home}/.gitignore` },
  { source: `${home}/.local/share/qBittorrent/themes/qbittorrent-darkstylesheet.qbtheme` },
  { source: `${home}/.profile` },
  // { source: `${home}/repo-checker.config.js` },
]

const windowsConfigs = [
  { renameTo: '.bashrc-windows', source: `${home}/.bashrc` },
  { removeLinesAfter: /\[History\]/u, removeLinesMatching: [/^(?:pos=|proxyType=)/u], source: `${appData}/Launchy/launchy.ini` },
  { renameTo: 'espanso-config.yml', source: 'D:/Apps/Espanso/.espanso/config/default.yml' },
  { renameTo: 'espanso-match.yml', source: 'D:/Apps/Espanso/.espanso/match/base.yml' },
  {
    removeLinesAfter: /PowerpointSlideLayout=ppLayoutPictureWithCaption/u,
    removeLinesMatching: [/^(?:BaseIconSize|ImgurUploadHistory|LastCapturedRegion|LastSaveWithVersion|LastUpdateCheck|OutputFileAsFull|OutputFilePath|DeletedBuildInCommands|Win10BorderCrop|Commands=)/u, /MS Paint/u, /Paint\.NET/u],
    source: `${appData}/Greenshot/Greenshot.ini`,
  },
]

const linuxConfigs = [
  { renameTo: '.bashrc-linux', source: `${home}/.bashrc` },
  { source: `${home}/.config/autostart/xbox-controller-driver.desktop` },
  { renameTo: 'ulauncher-scripts.json', source: `${home}/.config/ulauncher/scripts.json` },
  { source: `${home}/.local/share/applications/add-stuff.desktop` },
  { source: `${home}/.local/share/applications/app-image-pool.desktop` },
  { source: `${home}/.local/share/applications/appimagekit-photopea.desktop` },
  { source: `${home}/.local/share/applications/boxy.desktop` },
  { source: `${home}/.local/share/applications/electorrent.desktop` },
  { source: `${home}/.local/share/applications/font-base.desktop` },
  { source: `${home}/.local/share/applications/imagine.desktop` },
  { source: `${home}/.local/share/applications/isolate-lines-clipboard.desktop` },
  { source: `${home}/.local/share/applications/league-of-legends.desktop` },
  { source: `${home}/.local/share/applications/lol-practice-5v5.desktop` },
  { source: `${home}/.local/share/applications/stuff-finder.desktop` },
  { source: `${home}/.local/share/kio/servicemenus/take-screenshot.desktop` },
  // { source: `${home}/.local/share/nautilus/scripts/Shrink all pdf`},
  // { source: `${home}/.local/share/nautilus/scripts/Take screenshot`},
]
// oxlint-enable sort-keys

configs.push(...(isWindows ? windowsConfigs : linuxConfigs))

const currentFolder = import.meta.dirname

/**
 * Transform a file path to a FileDetails object
 * @param {string} filepath the file path
 * @returns {import('./types.js').FileDetails} the file details
 */
function getDetails(filepath) {
  const isExisting = existsSync(filepath)
  const content = isExisting ? readFileSync(filepath, 'utf8') : ''
  const updatedContent = content.includes('\r') && !filepath.includes('.qbtheme') ? useUnixCarriageReturn(content) : content // qbtheme files does not like \n
  const isContentEquals = content === updatedContent
  if (!isContentEquals) writeFile(filepath, updatedContent)
  return { content: updatedContent, filepath, isExisting }
}

/**
 * Get the filename from the config
 * @param {import('./types.js').Config} config the config
 * @returns the filename
 */
function getFilename({ renameTo, source }) {
  return renameTo ?? path.basename(source)
}

/**
 * Check if the source and destination files content are equals
 * @param {import('./types.js').File} file the file to be checked
 * @param {import('./types.js').Config} config the config
 * @returns true if the files are equals
 */
function isEquals(file, config) {
  const { destination, source } = file
  const { removeLinesAfter, removeLinesMatching } = config
  const filename = getFilename(config)
  const areEquals = clean(source.content, removeLinesAfter, removeLinesMatching) === clean(destination.content, removeLinesAfter, removeLinesMatching)
  if (!areEquals) {
    writeFileSync(path.join(changesFolderPath, `${filename}-source.log`), clean(source.content, removeLinesAfter, removeLinesMatching, false))
    writeFileSync(path.join(changesFolderPath, `${filename}-destination.log`), clean(destination.content, removeLinesAfter, removeLinesMatching, false))
  }
  return areEquals
}

export const backupPath = path.join(currentFolder, './files')

/** @type {import('./types.js').File[]} */
export const files = configs.map(config => {
  const filename = getFilename(config)
  const source = getDetails(config.source)
  const destination = getDetails(path.join(backupPath, filename))
  const /** @type {import('./types.js').File} */ file = { areEquals: false, destination, source }
  file.areEquals = isEquals(file, config)
  if (config.removeLinesMatching) file.removeLinesMatching = config.removeLinesMatching
  if (config.removeLinesAfter) file.removeLinesAfter = config.removeLinesAfter
  return file
})
