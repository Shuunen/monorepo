import { readFileSync, writeFileSync } from 'node:fs'
import glob from 'tiny-glob'
import { gray, green, red, yellow } from '../lib/colors.js'
import { nbThird } from '../lib/constants.js'
import { Logger } from '../lib/logger.js'
import { Result } from '../lib/result.js'

// use me like : bun libs/utils/src/bin/header-injector.cli.ts --header="// Copyright 2025 ACME"

/* v8 ignore next -- @preserve */
const logger = new Logger({ minimumLevel: import.meta.main ? '3-info' : '7-error' })
const metrics = {
  /** Number of files that already have the header */
  hasHeader: 0,
  /** Number of files that were fixed (header added) */
  nbFixed: 0,
  /** Number of files that do not have the header */
  noHeader: 0,
  /** Number of files that could not be read */
  readError: 0,
  /** Number of files that could not be written */
  writeError: 0,
}
type Metrics = typeof metrics

/**
 * Entry point for the header-injector CLI
 * @param argv the command-line arguments to parse (for testing purposes)
 * @returns metrics or error
 */
export async function main(argv: string[]) {
  const stats = structuredClone(metrics)
  const args = parseArgs(argv)
  logger.info('header-injector.cli.ts started with args', yellow(JSON.stringify(args)))
  if (!args.header) return Result.error('missing header argument')
  const files = await glob('**/!(*routeTree.gen|*.d).ts', { filesOnly: true })
  const header = `// ${args.header}`
  logger.info(`Scanning headers of ${files.length} files...`)
  for (const file of files) processFile(file, header, stats)
  return Result.ok(stats)
}

/**
 * Parse command-line arguments into a key-value object
 * @param argv the command-line arguments
 * @returns parsed arguments as key-value pairs
 */
function parseArgs(argv: string[]) {
  return Object.fromEntries(argv.slice(nbThird).map(arg => arg.replace('--', '').split('=')))
}

/**
 * Check if a file has the header
 * @param content the file content
 * @param header the header string to check
 * @returns true if the file has the header
 */
function hasHeader(content: string, header: string): boolean {
  const firstLine = content.split('\n')[0]
  return firstLine.includes(header)
}

/**
 * Inject header into file content
 * @param file the file path
 * @param newContent the new content with header
 * @returns true if write succeeded
 */
function writeFileWithHeader(file: string, newContent: string): boolean {
  const writeResult = Result.trySafe(() => writeFileSync(file, newContent))
  return writeResult.ok
}

/**
 * Process a single file to check and inject header if missing
 * @param file the file path to process
 * @param header the header string to inject
 * @param stats the metrics object to update
 * @returns void
 */
function processFile(file: string, header: string, stats: Metrics) {
  const readResult = Result.trySafe(() => readFileSync(file, 'utf8'))
  if (!readResult.ok) {
    stats.readError += 1
    return
  }
  const content = readResult.value as string
  if (hasHeader(content, header)) {
    stats.hasHeader += 1
    return
  }
  stats.noHeader += 1
  const newContent = `${header}\n${content}`
  const writeSuccess = writeFileWithHeader(file, newContent)
  if (!writeSuccess) {
    stats.writeError += 1
    return
  }
  stats.nbFixed += 1
}

/**
 * Generate a report string from the metrics
 * @param metrics the metrics object
 * @returns formatted report string
 */
export function report(metrics: Metrics): string {
  return `Header Injector report :
  - Files with header : ${metrics.hasHeader === 0 ? gray('0') : green(metrics.hasHeader.toString())}
  - Files without header : ${metrics.noHeader === 0 ? gray('0') : yellow(metrics.noHeader.toString())}
  - Files fixed : ${metrics.nbFixed === 0 ? gray('0') : green(metrics.nbFixed.toString())}
  - Files read errors : ${metrics.readError === 0 ? gray('0') : red(metrics.readError.toString())}
  - Files write errors : ${metrics.writeError === 0 ? gray('0') : red(metrics.writeError.toString())}
  `.trim()
}

/* v8 ignore if -- @preserve */
if (import.meta.main) {
  const result = await main(process.argv)
  if (result.ok) logger.info(report(result.value))
  else logger.error('header-injector.cli.ts finished with error')
}
