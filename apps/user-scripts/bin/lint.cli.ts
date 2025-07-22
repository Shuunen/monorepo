import fs from 'node:fs'
import path from 'node:path'
import { Logger } from '@shuunen/shuutils'

const srcDir = path.resolve(__dirname, '../src')
const filePattern = /\.user\.js$/
const logger = new Logger()

const regexUserScriptName = /^\/\/ ==UserScript==\n\/\/ @name/m
const regexDownloadUrl = /@downloadURL\s+https:\/\/github.com\/Shuunen\/monorepo\/raw\/master\/apps\/user-scripts\/src\/.+\.user\.js/
const regexUpdateUrl = /@updateURL\s+https:\/\/github.com\/Shuunen\/monorepo\/raw\/master\/apps\/user-scripts\/src\/.+\.user\.js/
const regexMatchDomain = /\*\.[^\s]+\.com/
const regexIcon = /@icon\s+https:\/\/www\.google\.com\/s2\/favicons\?sz=64&domain=[^\s]+/
const regexMainFuncKebab = /-([a-z])/g
const regexMainFuncPascal = /^(..)/
const regexMainFuncDef = (name: string) => new RegExp(`function ${name}\\(`)
const regexExportPattern1 = /if \(globalThis\.window\) [A-Z][A-Za-z0-9_]*\(\)/
const regexExportPattern2 = /if \(globalThis\.window\) [A-Z][A-Za-z0-9_]*\(\)\nelse module\.exports = \{.*\}/s
const regexIife = /\(function [A-Z][A-Za-z0-9_]*\(\) \{[\s\S]*\}\)\(\);/

const guidelines = [
  {
    check: (content: string) => regexUserScriptName.test(content),
    error: 'missing or misplaced @name meta (should be second line)',
    name: '@name second line',
  },
  {
    check: (content: string) => regexDownloadUrl.test(content) && regexUpdateUrl.test(content),
    error: 'missing or incorrect @downloadURL/@updateURL',
    name: '@downloadURL/@updateURL',
  },
  {
    check: (content: string) => !regexMatchDomain.test(content),
    error: 'wildcard in @match domain is not allowed',
    name: '@match domain',
  },
  {
    check: (content: string) => regexIcon.test(content),
    error: 'missing or incorrect @icon meta',
    name: '@icon domain',
  },
  {
    check: (content: string, filePath: string) => {
      const baseName = path.basename(filePath, '.user.js')
      // oxlint-disable-next-line id-length
      const expectedName = baseName.replace(regexMainFuncKebab, (_, character) => character.toUpperCase()).replace(regexMainFuncPascal, matchGroup => matchGroup[0].toUpperCase() + matchGroup[1])
      return regexMainFuncDef(expectedName).test(content)
    },
    error: 'main function name does not match filename (PascalCase)',
    name: 'main function name',
  },
  {
    check: (content: string) => regexExportPattern1.test(content) || regexExportPattern2.test(content),
    error: 'missing or incorrect export pattern',
    name: 'export pattern',
  },
  {
    check: (content: string) => !regexIife.test(content),
    error: 'IIFE pattern is not allowed',
    name: 'no IIFE',
  },
]

function lintFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues: string[] = []
  for (const rule of guidelines) if (!rule.check(content, filePath)) issues.push(rule.error)
  return issues
}

function main() {
  const files = fs
    .readdirSync(srcDir)
    .filter(fileName => filePattern.test(fileName))
    .map(fileName => path.join(srcDir, fileName))
  for (const filePath of files) {
    const issues = lintFile(filePath)
    for (const issue of issues) logger.error(`File: ${filePath} - Issue: ${issue}`)
    if (issues.length > 0) throw new Error('Lint issues found.')
  }
  logger.success('All user-scripts passed guideline linting.')
}

main()
