/** biome-ignore-all lint/suspicious/noAssignInExpressions: it'ok here */
import { readFileSync, writeFileSync } from 'node:fs'
import glob from 'tiny-glob'
import { gray, green, red, yellow } from '../lib/colors.js'
import { nbThird } from '../lib/constants.js'
import { Logger } from '../lib/logger.js'
import { clone } from '../lib/object-clone.js'
import { Result } from '../lib/result.js'

// use me like : bun libs/utils/src/bin/header-injector.cli.ts --header="// Copyright 2025 ACME"

/* c8 ignore next */
const logger = new Logger({ minimumLevel: import.meta.main ? '3-info' : '7-error' })
const metrics = {
  hasHeader: 0,
  nbFixed: 0,
  noHeader: 0,
  readError: 0,
  writeError: 0,
}
type Metrics = typeof metrics

export async function main(argv: string[]) {
  const stats = clone(metrics)
  const args = parseArgs(argv)
  logger.info('header-injector.cli.ts started with args', yellow(JSON.stringify(args)))
  if (!args.header) return Result.error('missing header argument')
  const files = await glob('**/*.ts', { filesOnly: true })
  logger.info(`Scanning headers of ${files.length} files...`)
  for (const file of files) processFile(file, args.header, stats)
  return Result.ok(stats)
}

function parseArgs(argv: string[]) {
  return Object.fromEntries(argv.slice(nbThird).map(arg => arg.replace('--', '').split('=')))
}

function processFile(file: string, header: string, stats: Metrics) {
  const readResult = Result.trySafe(() => readFileSync(file, 'utf8'))
  if (!readResult.ok) return (stats.readError += 1)
  const content = readResult.value as string
  const firstLine = content.split('\n')[0]
  if (firstLine.includes(header)) return (stats.hasHeader += 1)
  stats.noHeader += 1
  const newContent = `${header}\n${content}`
  const writeResult = Result.trySafe(() => writeFileSync(file, newContent))
  if (!writeResult.ok) return (stats.writeError += 1)
  return (stats.nbFixed += 1)
}

export function report(metrics: Metrics): string {
  return `Header Injector report :
  - Files with header : ${metrics.hasHeader === 0 ? gray('0') : green(metrics.hasHeader.toString())}
  - Files without header : ${metrics.noHeader === 0 ? gray('0') : yellow(metrics.noHeader.toString())}
  - Files fixed : ${metrics.nbFixed === 0 ? gray('0') : green(metrics.nbFixed.toString())}
  - Files read errors : ${metrics.readError === 0 ? gray('0') : red(metrics.readError.toString())}
  - Files write errors : ${metrics.writeError === 0 ? gray('0') : red(metrics.writeError.toString())}
  `.trim()
}

/* c8 ignore start */
if (import.meta.main) {
  const result = await main(process.argv)
  if (result.ok) logger.info(report(result.value))
  else logger.error('header-injector.cli.ts finished with error')
}
