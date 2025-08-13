import { div, nbFirst, nbFourth, nbSecond, nbThird, on, readClipboard, text, tw } from '@shuunen/shuutils'
import { parseClipboard, validateCredentials } from '../utils/credentials.utils'
import { downloadData } from '../utils/database.utils'
import { form } from '../utils/dom.utils'
import { logger } from '../utils/logger.utils'
import { type CredentialField, state, watchState } from '../utils/state.utils'

const credentials = div('credentials hidden pt-4')

const message = text(
  tw('pb-2 leading-7'),
  `
  This webapp has been deployed from this open-source code <a class="border-b" href="https://github.com/Shuunen/what-now" target="_blank">on Github</a>. <br>
  Please check the above link to be introduced to this app : what is it and how to use it.
`,
)
credentials.append(message)

const fields = [
  { href: 'https://cloud.appwrite.io/', label: 'AppWrite database id', link: 'AppWrite cloud', maxlength: 100, name: 'appwrite-database-id', pattern: String.raw`^\w+$` },
  { href: 'https://cloud.appwrite.io/', label: 'AppWrite collection id', link: 'AppWrite cloud', maxlength: 100, name: 'appwrite-collection-id', pattern: String.raw`^\w+$` },
  { href: 'https://developers.meethue.com/develop/get-started-2/', label: 'Hue status light', link: 'find my endpoint', maxlength: 150, name: 'hue-status-light', pattern: '^https://.+$' },
  { href: 'https://usetrmnl.com/', label: 'Trmnl Webhook', link: 'Get your device and webhook', maxlength: 150, name: 'trmnl-webhook', pattern: '^https?://.+$' },
] as const
const formElement = form(fields)
credentials.append(formElement)

/**
 * Get form credentials
 * @returns the form credentials
 */
function getFormCredentials() {
  const apiDatabase = (formElement.elements[nbFirst] as HTMLInputElement).value
  const apiCollection = (formElement.elements[nbSecond] as HTMLInputElement).value
  const hueEndpoint = (formElement.elements[nbThird] as HTMLInputElement).value
  const trmnlWebhook = (formElement.elements[nbFourth] as HTMLInputElement).value
  const isOk = validateCredentials(apiDatabase, apiCollection)
  state.statusError = isOk ? '' : 'Invalid credentials'
  return { apiCollection, apiDatabase, hueEndpoint, isOk, trmnlWebhook } satisfies Record<CredentialField, string> & { isOk: boolean }
}

formElement.addEventListener('submit', (event: Event) => {
  event.preventDefault()
  const { apiCollection, apiDatabase, hueEndpoint, trmnlWebhook, isOk } = getFormCredentials()
  if (!isOk) return
  logger.info('credentials submitted', { apiCollection, apiDatabase, hueEndpoint, trmnlWebhook })
  state.apiDatabase = apiDatabase
  state.apiCollection = apiCollection
  state.hueEndpoint = hueEndpoint
  state.trmnlWebhook = trmnlWebhook
  state.isSetup = true
})

/**
 * Fill the form
 * @param data - the data to fill the form with
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: this whole thing gonna be refactored later
function fillForm(data: Readonly<Record<CredentialField, string>>) {
  logger.info('credentials, fill form', data)
  const { apiCollection, apiDatabase, hueEndpoint } = data
  const inputs = Array.from(formElement.elements)
  for (const input of inputs) {
    if (!(input instanceof HTMLInputElement)) continue
    if (input.name === fields[nbFirst].name && apiDatabase.length > 0) input.value = apiDatabase
    else if (input.name === fields[nbSecond].name && apiCollection.length > 0) input.value = apiCollection
    else if (input.name === fields[nbThird].name && hueEndpoint.length > 0) input.value = hueEndpoint
    else if (input.name === fields[nbFourth].name && data.trmnlWebhook.length > 0) input.value = data.trmnlWebhook
    else logger.debug('nothing to fill')
  }
}

watchState('isSetup', () => {
  credentials.classList.toggle('hidden', state.isSetup)
  fillForm(state)
})

on('focus', async () => {
  if (state.isSetup) return
  const result = await readClipboard()
  if (!result.ok) return logger.error('failed to read clipboard', result.error)
  logger.info('clipboard contains :', result.value)
  fillForm(parseClipboard(result.value))
})

on('download-data-click', () => {
  void downloadData()
})

export { credentials }
