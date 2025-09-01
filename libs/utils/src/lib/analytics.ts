import { Logger } from './logger.js'
import { Result } from './result.js'

export type AnalyticsOptions = Readonly<{
  app?: string
  onIdentify?: (userId: string, additionalData?: Record<string, unknown>) => unknown
  onPage?: () => unknown
  onTrack?: (event: string, additionalData?: Record<string, unknown>) => unknown
  willLog?: boolean
  willPile?: boolean
}>

/**
 * Generic analytics wrapper, can be used with any analytics third party library
 * @param options the options for the analytics
 * @param options.app the app name, like 'my-project', 'super-app', etc.
 * @param options.onIdentify the callback to identify a user
 * @param options.onPage the callback to track a page
 * @param options.onTrack the callback to track an event
 * @param options.willLog if the analytics will log
 * @param options.willPile if the analytics will pile the events in memory
 * @returns the analytics object
 */
// oxlint-disable-next-line max-lines-per-function
export function createAnalytics({ app = 'app-default', onIdentify, onPage, onTrack, willLog = false, willPile = false }: AnalyticsOptions | undefined = {}) {
  const pile: string[] = []
  const logger = willLog ? new Logger() : undefined
  /**
   * Add an item to the memory pile
   * @param item the item to add
   * @param data the data to add
   * @returns the result of the operation
   */
  function addToPile(item: string, data?: Record<string, unknown>) {
    logger?.debug(`analytics : "${item}" added to pile`, data)
    pile.push(item)
    logger?.debug(`analytics : pile for app "${app}"`, pile)
    return Result.ok(`analytics : "${item}" added to pile`)
  }
  /**
   * Identify a user
   * @param userId - The user, like '123456', 'super-admin', etc.
   * @param additionalData - Additional data to identify the user
   * @returns a Result object
   */
  function identify(userId: string, additionalData?: Record<string, unknown>) {
    const message = `analytics : identify user "${userId}" on app "${app}"`
    onIdentify?.(userId, additionalData)
    logger?.debug(message)
    if (willPile) addToPile(`identify:${userId}`)
    return Result.ok(message)
  }
  /**
   * Track a page view
   * @returns a Result object
   */
  function page() {
    const message = `analytics : track page for app "${app}"`
    onPage?.()
    logger?.debug(message)
    if (willPile) addToPile('page')
    return Result.ok(message)
  }
  /**
   * Track an event
   * @param event The event name like 'click', 'download-invoice', etc.
   * @param additionalData Additional data to track the event
   * @returns a Result object
   */
  function track(event: string, additionalData?: Record<string, unknown>) {
    const message = `analytics : track event "${event}" for app "${app}"`
    onTrack?.(event, additionalData)
    logger?.debug(message)
    if (willPile) addToPile(`track:${event}`)
    return Result.ok(message)
  }
  return { identify, page, pile, track }
}
