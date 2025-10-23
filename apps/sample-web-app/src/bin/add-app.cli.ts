/* v8 ignore start -- @preserve */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { green, Logger, nbSpacesIndent, nbThird } from '@monorepo/utils'

// use me like : bun bin/add-app.cli.ts <app-name>
// or pnpm run add:app <app-name>

const logger = new Logger()
const filesToUse = ['index.html', 'netlify.toml', 'package.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json', 'vite.config.ts', 'public/favicon.ico', 'src/main.tsx', 'src/styles.css', 'src/assets/.gitkeep', 'src/app/app.tsx', 'src/app/app.test.tsx']
const appName = process.argv.slice()[nbThird]

function copyFile(sourceFile: string, targetFile: string, appName: string): void {
  const content = readFileSync(sourceFile, 'utf8')
  const updatedContent = content.replace(/sample-web-app/g, appName)
  const dir = dirname(targetFile)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(targetFile, updatedContent)
  logger.debug(`Copied: ${targetFile}`)
}

function copyFiles(appName: string): void {
  const sourceDir = join(process.cwd(), 'apps', 'sample-web-app')
  const targetDir = join(process.cwd(), 'apps', appName)
  logger.info(`Creating app...`)
  for (const file of filesToUse) copyFile(join(sourceDir, file), join(targetDir, file), appName)
}

function updateTsConfig(appName: string): void {
  logger.info('Updating tsconfig.json...')
  const tsConfigPath = join(process.cwd(), 'tsconfig.json')
  const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'))
  tsConfig.references.push({ path: `./apps/${appName}` })
  // sort the references array for nicer git diffs
  tsConfig.references.sort((referenceA: { path: string }, referenceB: { path: string }) => referenceA.path.localeCompare(referenceB.path))
  writeFileSync(tsConfigPath, JSON.stringify(tsConfig, undefined, nbSpacesIndent))
  logger.debug(`Updated tsconfig.json`)
}

function installDependencies(): void {
  logger.info('Installing dependencies...')
  execSync('pnpm install')
  logger.debug('Dependencies installed successfully')
}

function addApp(appName: string): void {
  copyFiles(appName)
  updateTsConfig(appName)
  installDependencies()
  logger.success(`Created a new app in ${green(`apps/${appName}`)} 👌`)
  logger.info(`You can now run your app with ${green(`nx dev ${appName}`)} or do any other usual command you like : build, test, etc.`)
}

if (appName) addApp(appName)
else {
  logger.error('Usage: pnpm run add:app <app-name>')
  process.exit(1)
}
