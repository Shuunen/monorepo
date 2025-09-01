import { createState, sleep } from '@monorepo/utils'
import { getBottles, pour } from './bottle.utils'
import type { Bottle } from './colors.utils'
import { logger } from './logger.utils'

type State = 'initial' | 'loose' | 'pouring' | 'ready' | 'selected' | 'win'

type Context = { bottles: Bottle[]; selected: number; state: State }

/**
 * Vanilla state machine <3
 */
export class Machine {
  readonly #context: Context = { bottles: [], selected: -1, state: 'initial' }
  public readonly watchContext: (key: keyof Context, callback: () => void) => void
  /** Constructor */
  public constructor() {
    const { state, watchState } = createState<Context>(this.#context)
    this.#context = state
    this.watchContext = watchState
  }
  /**
   * Check if the player won
   */
  #checkWin() {
    const { bottles } = this.#context
    /* c8 ignore next 2 */
    // oxlint-disable-next-line max-nested-callbacks
    if (bottles.every(bottle => bottle.every(color => color === bottle[0]))) this.#transition('ready', 'win')
  }
  /**
   * Transition from one state to another
   * @param from the state to transition from
   * @param to the next state
   */
  #transition(from: State, to: State) {
    logger.debug(`state transition ${from} => ${to} (actual ${this.state})`)
    if (from !== this.state) throw new Error(`state cannot apply transition ${from} => ${to} (actual ${this.state})`)
    this.#context.state = to
  }
  /**
   * Bottles getter
   * @returns the bottles
   */
  public get bottles() {
    return this.#context.bottles
  }
  /**
   * Deselect a bottle
   * @param from the state to transition from
   */
  public deselect(from: State = 'selected') {
    this.#transition(from, 'ready')
    this.#context.selected = -1
  }
  /**
   * Get the icon for the current state
   * @returns the icon
   */
  public icon() {
    const state = this.state
    /* c8 ignore next 7 */
    if (state === 'initial') return '🎬'
    if (state === 'ready') return '🏎️'
    if (state === 'selected') return '🏹'
    if (state === 'pouring') return '💧'
    if (state === 'win') return '🥳'
    if (state === 'loose') return '😭'
    return '🤔'
  }
  /**
   * Pour the selected bottle into another bottle
   * @param index the index of the bottle to pour into
   */
  public async pour(index: number) {
    this.#transition('selected', 'pouring')
    const { bottles, selected } = this.#context
    logger.info(`pouring bottle ${selected} into bottle ${index}`)
    // oxlint-disable-next-line no-magic-numbers
    await sleep(600)
    const from = bottles[selected]
    const to = bottles[index]
    /* c8 ignore next */
    if (!from || !to) throw new Error('bottle from/to not found')
    const [fromUpdated, toUpdated] = pour(from, to)
    bottles[selected] = fromUpdated
    bottles[index] = toUpdated
    this.deselect('pouring')
    this.#checkWin()
  }
  /**
   * Reset the game
   */
  public reset() {
    this.deselect(this.state)
    this.#transition('ready', 'initial')
  }
  /**
   * Select a bottle
   * @param index the index of the bottle to select
   */
  public select(index: number) {
    logger.debug('state select')
    this.#transition('ready', 'selected')
    this.#context.selected = index
  }
  /**
   * Selected getter
   * @returns the selected bottle
   */
  public get selected() {
    return this.#context.selected
  }
  /**
   * Start the game
   */
  public start() {
    logger.debug('state start')
    this.#transition('initial', 'ready')
    this.#context.bottles = getBottles()
  }
  /**
   * State getter
   * @returns the current state
   */
  public get state() {
    return this.#context.state
  }
}

export const machine = new Machine()
