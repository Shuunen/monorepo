import { Button } from '@shuunen/components'
import { nbFirst, nbSecond, nbThird, on, readClipboard } from '@shuunen/shuutils'
import { ExternalLinkIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { parseClipboard, validateCredentials } from '../utils/credentials.utils'
import { logger } from '../utils/logger.utils'
import { type CredentialField, state } from '../utils/state.utils'

const fields = [
  { href: 'https://cloud.appwrite.io/', label: 'AppWrite database id', link: 'appwrite dashboard', maxlength: 100, name: 'appwrite-database-id', pattern: String.raw`^\w+$` },
  { href: 'https://cloud.appwrite.io/', label: 'AppWrite collection id', link: 'appwrite dashboard', maxlength: 100, name: 'appwrite-collection-id', pattern: String.raw`^\w+$` },
  { href: 'https://developers.meethue.com/develop/get-started-2/', label: 'Hue status light', link: 'find endpoint', maxlength: 150, name: 'hue-status-light', pattern: '^https://.+$' },
  { href: 'https://usetrmnl.com/', label: 'Trmnl Webhook', link: 'get webhook', maxlength: 150, name: 'trmnl-webhook', pattern: '^https?://.+$' },
] as const

type FormData = {
  apiCollection: string
  apiDatabase: string
  hueEndpoint: string
  trmnlWebhook: string
}

function getFieldValue(index: number, formData: FormData): string {
  if (index === nbFirst) return formData.apiDatabase
  if (index === nbSecond) return formData.apiCollection
  if (index === nbThird) return formData.hueEndpoint
  return formData.trmnlWebhook
}

function getFieldKey(index: number): keyof FormData {
  if (index === nbFirst) return 'apiDatabase'
  if (index === nbSecond) return 'apiCollection'
  if (index === nbThird) return 'hueEndpoint'
  return 'trmnlWebhook'
}

type CredentialsFormProps = {
  formData: FormData
  onInputChange: (field: keyof FormData, value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

function CredentialsForm({ formData, onInputChange, onSubmit }: CredentialsFormProps) {
  return (
    <form onSubmit={onSubmit}>
      {fields.map((field, index) => {
        const inputId = `input-${field.name}`
        return (
          <div className="mb-5" key={field.name}>
            <label className="flex gap-2 text-sm font-medium mb-1" htmlFor={inputId}>
              {field.label}
              <a className="flex items-center underline opacity-50 hover:opacity-100 transition-opacity" href={field.href} rel="noopener noreferrer" target="_blank">
                (&thinsp;{field.link}
                <ExternalLinkIcon className="size-4 ml-1" />)
              </a>
            </label>
            <input
              className="w-full px-3 py-2 border border-accent/50 rounded-md focus:outline-none focus:ring-2 "
              id={inputId}
              maxLength={field.maxlength}
              name={field.name}
              onChange={event => {
                const fieldKey = getFieldKey(index)
                onInputChange(fieldKey, event.target.value)
              }}
              pattern={field.pattern}
              type="text"
              value={getFieldValue(index, formData)}
            />
          </div>
        )
      })}

      <div className="flex gap-4 justify-center">
        <Button type="submit">Save Credentials</Button>
      </div>
    </form>
  )
}

function useCredentialsLogic() {
  const [formData, setFormData] = useState<FormData>({
    apiCollection: state.apiCollection,
    apiDatabase: state.apiDatabase,
    hueEndpoint: state.hueEndpoint,
    trmnlWebhook: state.trmnlWebhook,
  })

  const fillForm = useCallback((data: Readonly<Record<CredentialField, string>>) => {
    logger.info('credentials, fill form', data)
    setFormData({
      apiCollection: data.apiCollection || '',
      apiDatabase: data.apiDatabase || '',
      hueEndpoint: data.hueEndpoint || '',
      trmnlWebhook: data.trmnlWebhook || '',
    })
  }, [])

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(previous => ({ ...previous, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      const { apiCollection, apiDatabase, hueEndpoint, trmnlWebhook } = formData
      const isOk = validateCredentials(apiDatabase, apiCollection)
      state.statusError = isOk ? '' : 'Invalid credentials'

      if (!isOk) return

      logger.info('credentials submitted', { apiCollection, apiDatabase, hueEndpoint, trmnlWebhook })
      state.apiDatabase = apiDatabase
      state.apiCollection = apiCollection
      state.hueEndpoint = hueEndpoint
      state.trmnlWebhook = trmnlWebhook
      state.isSetup = true
    },
    [formData],
  )

  return { fillForm, formData, handleInputChange, handleSubmit }
}

export function Credentials() {
  const { fillForm, formData, handleInputChange, handleSubmit } = useCredentialsLogic()

  const handleFocus = useCallback(async () => {
    if (state.isSetup) return
    const result = await readClipboard()
    if (!result.ok) return logger.error('failed to read clipboard', result.error)
    logger.info('clipboard contains :', result.value)
    const data = parseClipboard(result.value)
    if (data.apiCollection) fillForm(data)
  }, [fillForm])

  useEffect(() => {
    on('focus', handleFocus)
  }, [handleFocus])

  return (
    <div data-testid="credentials">
      <CredentialsForm formData={formData} onInputChange={handleInputChange} onSubmit={handleSubmit} />
    </div>
  )
}
