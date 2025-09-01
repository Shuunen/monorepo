import { spawn } from 'node:child_process'
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { green, Logger, nbThird, yellow } from '../../utils/src'

const logger = new Logger()
const [component] = process.argv.slice(nbThird)

function exitWithError(message: string) {
  logger.error(message)
  process.exit(1)
}

if (!component) exitWithError('Please provide a component name to add, ex : pnpm add:shadcn breadcrumb')

function moveComponent() {
  const sourceFile = join(process.cwd(), '@shadcn', `${component}.tsx`)
  const targetDir = join(process.cwd(), 'libs', 'components', 'src', 'shadcn')
  const targetFile = join(targetDir, `${component}.tsx`)
  if (!existsSync(sourceFile)) exitWithError(`Source file not found: ${sourceFile}`)
  try {
    renameSync(sourceFile, targetFile)
    logger.success(`Component moved`)
    rmSync(join(process.cwd(), '@shadcn'), { force: true, recursive: true })
  } catch (error) {
    exitWithError(`Failed to move component: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function fixImports() {
  const filePath = join(process.cwd(), 'libs', 'components', 'src', 'shadcn', `${component}.tsx`)
  let content = readFileSync(filePath, 'utf8')
  content = content.replace('@shadcn/', './')
  writeFileSync(filePath, content, 'utf8')
  logger.success(`Imports fixed`)
}

function setupComponent() {
  logger.success('Downloaded successfully')
  logger.info('Setup component...')
  moveComponent()
  fixImports()
  // TODO : add the related story if it exists
  // https://raw.githubusercontent.com/lloydrichards/shadcn-storybook-registry/refs/heads/main/registry/command.stories.tsx
  logger.success(`Component ${green(component)} is ready to use in libs/components 🚀`)
}

function downloadComponent() {
  logger.info(`Downloading ShadCn component ${green(component)}...`)
  const args = ['dlx', 'shadcn@latest', 'add', '--yes', '--overwrite', `--cwd=libs/components`, component]
  const command = [`pnpm`, ...args].join(' ')
  logger.debug('Executing download command :', yellow(command))
  const child = spawn('pnpm', args, { stdio: 'pipe' })
  child.stderr.on('data', data => logger.debug('ShadCn cli', data.toString().trim().slice(nbThird).toLowerCase()))
  child.on('close', code => {
    if (code === 0) setupComponent()
    else exitWithError(`Command failed with exit code : ${code}`)
  })
  child.on('error', error => exitWithError(`Command failed : ${error.message}`))
}

downloadComponent()
