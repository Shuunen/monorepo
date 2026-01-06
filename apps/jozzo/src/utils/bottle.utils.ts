import { pickOne, randomNumber } from '@monorepo/utils'
import { type Bottle, type Color, getNextColor } from './colors.utils'
import { logger } from './logger.utils'

const defaultBottleSize = 5

/**
 * Get the first color index
 * @param bottle the bottle to get the first color index from
 * @returns the first color index
 */
function getFirstColorIndex(bottle: Bottle) {
  return bottle.findIndex(color => color !== '')
}

/**
 * Return a string representation of a bottle
 * @param bottle the bottle to return a string representation of
 * @returns the string representation of the bottle
 */
export function asciiBottle(bottle: string[]) {
  const content = bottle
    .map(color => {
      if (color === '') return '▫️'
      if (color === 'green') return '🟩'
      if (color === 'blue') return '🟦'
      if (color === 'red') return '🟥'
      if (color === 'yellow') return '🟨'
      return color
    })
    .join('|')
  return `<${content}]`
}

/**
 * Get a bottle
 * @param fillWith the color to fill the bottle with
 * @param size the size of the bottle
 * @returns the bottle
 */
export function getBottle(fillWith: Color, size = defaultBottleSize) {
  const bottle: Bottle = []
  for (let index = 0; index < size; index += 1) bottle.push(fillWith)
  return bottle
}

/**
 * Pour colors from one bottle to another
 * @param from the bottle to pour from
 * @param to the bottle to pour to
 * @param amount the amount of colors to pour, if not provided, pour all colors possible
 * @returns the bottles after pouring
 */
// oxlint-disable-next-line max-lines-per-function,max-statements
export function pour(from: Readonly<Bottle>, to: Readonly<Bottle>, amount?: number) {
  const cloneFrom = Array.from(from)
  const cloneTo = Array.from(to)
  if (cloneFrom.every(color => color === '')) return [cloneFrom, cloneTo] satisfies [Bottle, Bottle]

  // oxlint-disable-next-line init-declarations
  let lastColor: Color | undefined
  const amountToPour = amount ?? from.filter(color => color !== '').length
  let nbPoured = 0

  for (let index = to.length - 1; index >= 0 && nbPoured < amountToPour; index -= 1) {
    logger.info(`looking at b at index ${index}, color there is ${to[index] === '' ? 'none' : to[index]}, nbPoured ${nbPoured}, lastColor ${lastColor}`)
    if (to[index] === '') {
      const colorIndex = getFirstColorIndex(cloneFrom)
      const color = cloneFrom[colorIndex]
      // oxlint-disable-next-line max-depth
      if (lastColor !== undefined && lastColor !== color) {
        logger.info(`skipping because lastColor (${lastColor}) is different from color (${color})`)
        break
      }
      logger.info(`pouring ${color} from a at index ${colorIndex} to b at index ${index}`)
      lastColor = color
      // oxlint-disable no-non-null-assertion
      // biome-ignore lint/style/noNonNullAssertion: needed
      cloneTo[index] = color!
      // oxlint-enable no-non-null-assertion
      cloneFrom[colorIndex] = ''
      nbPoured += 1
    } else logger.info('skipping because color already present')
  }
  logger.info(`updated from ${asciiBottle(cloneFrom)}, updated to ${asciiBottle(cloneTo)}`)

  return [cloneFrom, cloneTo] satisfies [Bottle, Bottle]
}

/**
 * Get a random bottle with space
 * @param bottles the bottles to get a random bottle with space from
 * @returns the bottle with space and its index
 */
export function getRandomBottleWithSpace(bottles: Bottle[]) {
  const bottlesWithSpace = bottles.filter(bottle => bottle.includes(''))
  const content = pickOne(bottlesWithSpace)
  const index = bottles.findIndex(bottle => bottle.join('-') === content.join('-'))
  return { bottleWithSpace: content, bottleWithSpaceIndex: index }
}

/**
 * Get a random bottle with colors
 * @param bottles the bottles to get a random bottle with colors from
 * @returns the bottle with colors and its index
 */
export function getRandomBottleWithColors(bottles: Bottle[]) {
  // oxlint-disable-next-line max-nested-callbacks
  const bottlesWithColors = bottles.filter(bottle => bottle.some(color => color !== ''))
  const content = pickOne(bottlesWithColors)
  const index = bottles.findIndex(bottle => bottle.join('-') === content.join('-'))
  return { bottleWithColors: content, bottleWithColorsIndex: index }
}

/**
 * Mix bottles together
 * @param bottles the bottles to mix
 * @returns the mixed bottles
 */
export function mixBottles(bottles: Bottle[]) {
  const mixedBottles: Bottle[] = structuredClone(bottles)
  const nbCycles = 20
  for (let cycle = 0; cycle < nbCycles; cycle += 1) {
    const { bottleWithSpace, bottleWithSpaceIndex } = getRandomBottleWithSpace(mixedBottles)
    const { bottleWithColors, bottleWithColorsIndex } = getRandomBottleWithColors(mixedBottles)
    if (bottleWithSpaceIndex === bottleWithColorsIndex) continue
    const nbSpaces = bottleWithSpace.filter(color => color === '').length
    const nbColorsToPour = randomNumber(1, Math.max(bottleWithColors.filter(color => color !== '').length - 1, nbSpaces))
    logger.info(`pouring ${nbColorsToPour} colors from bottle ${bottleWithColorsIndex} ${asciiBottle(bottleWithColors)} to bottle ${bottleWithSpaceIndex} ${asciiBottle(bottleWithSpace)}`)
    const [from, to] = pour(bottleWithColors, bottleWithSpace, nbColorsToPour)
    mixedBottles[bottleWithColorsIndex] = from
    mixedBottles[bottleWithSpaceIndex] = to
  }
  return mixedBottles
}

/**
 * Get bottles to initialize the game
 * @param nbBottles the number of bottles to get
 * @returns the bottles
 */
export function getBottles(nbBottles = 6) {
  const bottles: Bottle[] = []
  for (let index = 0; index < nbBottles; index += 1) bottles.push(getBottle(getNextColor()))
  // empty a random bottle to have space to pour
  const randomBottleIndex = Math.floor(Math.random() * nbBottles)
  bottles[randomBottleIndex] = getBottle('')
  logger.debug('bottles', bottles)
  return mixBottles(bottles)
}
