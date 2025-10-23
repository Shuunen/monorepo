/* v8 ignore start -- @preserve */
// oxlint-disable no-undef
// @ts-expect-error missing types
import { Logger } from '@monorepo/utils'
import mifare from 'mifare-classic'

const logger = new Logger()

logger.info('mifare-classic script starting')

mifare.read((/** @type {any} */ error, /** @type {{ toJSON: () => any; }} */ data, /** @type {any} */ uid) => {
  if (error) throw error
  logger.info('The NFC tag UID is', uid)
  // @ts-expect-error ndef not defined
  // biome-ignore lint/correctness/noUndeclaredVariables: old POC
  const message = ndef.decodeMessage(data.toJSON())
  // @ts-expect-error ndef not defined
  // biome-ignore lint/correctness/noUndeclaredVariables: old POC
  logger.info(ndef.stringify(message))
})
