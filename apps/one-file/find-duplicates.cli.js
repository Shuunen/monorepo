/* c8 ignore start */
// oxlint-disable no-magic-numbers, class-methods-use-this
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { Logger } from '@monorepo/utils'

const maxResults = 10
const sizeGrain = 10_000
const logger = new Logger()

class CheckDuplicates {
  constructor() {
    /**
     * @type {string[]}
     */
    this.elements = []
    this.detected = {}
    this.target = ''
    this.nbElements = 0
    /**
     * @type {{ [key: string]: string }}
     */
    this.results = {}
  }
  args() {
    if (process.argv.length < 4) throw new Error(String.raw`this script need a path as argument like : find-duplicates.js "U:\Movies\"`)
    this.target = path.normalize(process.argv[3] || '')
  }
  ellipsis(string = '', length = 40) {
    return string.length > length ? `${string.slice(0, Math.max(0, length - 3))}...` : string
  }
  distance(stringA = '', stringB = '') {
    // todo: something like levenshtein
    return stringA.length + stringB.length
  }
  report() {
    const list = Object.keys(this.results)
      .map(key => this.results[key])
      .sort()
    logger.info(list.splice(0, maxResults))
  }
  async start() {
    logger.info('\nCheck duplicates is starting !')
    this.args()
    await this.find()
    await this.check()
    this.report()
    logger.info('Check duplicates ended.')
  }

  async find() {
    logger.info(`Scanning dir ${this.target}`)
    this.elements = await readdir(this.target)
    this.nbElements = this.elements.length
    logger.info('Found', this.nbElements, 'elements')
  }

  // oxlint-disable-next-line max-lines-per-function
  async check() {
    this.results = {}
    for (let aIndex = 0; aIndex < this.nbElements; aIndex += 1)
      for (let bIndex = 0; bIndex < this.nbElements; bIndex += 1) {
        // oxlint-disable-next-line max-depth
        if (aIndex === bIndex) continue
        const itemA = String(this.elements[aIndex])
        const itemB = String(this.elements[bIndex])
        const key = `${aIndex}|${bIndex}`
        const keyAlt = `${bIndex}|${aIndex}`
        // oxlint-disable-next-line max-depth
        if (this.results[key] || this.results[keyAlt]) continue
        let amount = this.distance(itemA, itemB)
        // oxlint-disable-next-line no-await-in-loop
        const sizeA = await stat(path.join(this.target, itemA)).then((/** @type {{ size: number; }} */ data) => Math.round(data.size / sizeGrain))
        // oxlint-disable-next-line no-await-in-loop
        const sizeB = await stat(path.join(this.target, itemB)).then((/** @type {{ size: number; }} */ data) => Math.round(data.size / sizeGrain))
        const sizeDiff = Math.abs(sizeA - sizeB)
        amount += sizeDiff // add the size diff as distance ^^
        const amountString = (amount.toString().length === 1 ? '0' : '') + amount
        this.results[key] = `${amountString} (${sizeDiff}) : ${this.ellipsis(itemA)} VS ${this.ellipsis(itemB)}`
      }
  }
}

const instance = new CheckDuplicates()
await instance.start()
