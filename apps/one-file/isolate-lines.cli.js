/* c8 ignore start */
import { Logger } from '@monorepo/utils'
import clipboard from 'clipboardy'
import { isolateLines, linesToList } from './isolate-lines.utils.js' // js extension is required here

const logger = new Logger()

logger.info('isolate-lines.cli start')
const input = clipboard.readSync()
const lines = isolateLines(input)
const output = linesToList(lines)
logger.info(`will copy this to clipboard :\n---\n${output}\n--- ${new Date().toLocaleString()}`)
clipboard.writeSync(output)
