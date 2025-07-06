/* c8 ignore start */
import { isBrowserEnvironment, Logger } from '@shuunen/shuutils'
import { state } from './state.utils'

function stuffToMessage(...stuff: unknown[]) {
  return stuff
    .map(thing => {
      if (typeof thing === 'string') return thing
      if (typeof thing === 'object') return JSON.stringify(thing)
      return String(thing)
    })
    .join(', ')
}
class CustomLogger extends Logger {
  public override error(...stuff: unknown[]) {
    super.error(...stuff)
    state.showErrorToast = stuffToMessage(...stuff)
  }
}

const logger = new CustomLogger({ minimumLevel: '3-info', willOutputToConsole: isBrowserEnvironment() })

export { logger, stuffToMessage }
