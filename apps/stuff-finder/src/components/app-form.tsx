import Button from '@mui/material/Button'
import { useSignalEffect } from '@preact/signals'
import { Result, debounce, functionReturningVoid, off, on, parseJson, readClipboard } from '@shuunen/shuutils'
import { useCallback, useState } from 'preact/hooks'
import { type Form, alignClipboard, validateForm } from '../utils/forms.utils'
import { logger } from '../utils/logger.utils'
import { colSpanClass, gridClass } from '../utils/theme.utils'
import { AppFormFieldCheckbox } from './app-form-field-checkbox'
import { AppFormFieldSelect } from './app-form-field-select'
import { AppFormFieldText } from './app-form-field-text'

type Properties<FormType extends Form> = Readonly<{
  error?: string
  initialForm: FormType
  onChange?: (form: FormType) => void
  onSubmit?: ((form: FormType) => void) | undefined
  suggestions?: Record<string, string[]>
}>

// eslint-disable-next-line max-statements, max-lines-per-function, complexity
export function AppForm<FormType extends Form>({ error: parentError = '', initialForm, onChange = functionReturningVoid, onSubmit = undefined, suggestions = {} }: Properties<FormType>) {
  const [form, setForm] = useState(initialForm)

  const { hasChanged, updatedForm } = validateForm(form)
  if (hasChanged) {
    onChange(updatedForm)
    setForm(updatedForm)
  }

  const onFormSubmit = useCallback(
    (event: Event) => {
      event.preventDefault()
      onSubmit?.(form)
    },
    [form, onSubmit],
  )

  // eslint-disable-next-line max-statements
  function updateFieldSync(field: string, target: EventTarget | null, isFromClipboard = false) {
    if (target === null) return Result.error(`target for field "${field}" is null`)
    const input = target as HTMLInputElement // eslint-disable-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
    let value = input.type === 'checkbox' ? input.checked : input.value
    if (input.role === 'option') value = input.textContent ?? '' // handle autocomplete target
    logger.debug('updateField', { field, value })
    const actualField = form.fields[field]
    if (actualField === undefined) return Result.error(`field "${field}" not found in form`)
    if (isFromClipboard) logger.showSuccess(`Pasted "${field}" field value`)
    const updated = { ...form, fields: { ...form.fields, [field]: { ...actualField, value } }, isTouched: true }
    setForm(updated)
    onChange(updated)
    return Result.ok('field updated successfully')
  }

  const updateDelay = 100
  const updateField = debounce(updateFieldSync, updateDelay)

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const checkDataInClipboard = useCallback(async () => {
    const rawClip = await readClipboard()
    if (!rawClip.ok) {
      logger.error('error reading clipboard', rawClip.error)
      return
    }
    if (rawClip.value === '') {
      logger.info('clipboard is empty')
      return
    }
    const clip = alignClipboard(rawClip.value)
    const { error, value } = Result.unwrap(parseJson(clip))
    if (error || typeof value !== 'object' || value === null) {
      logger.info('error or data not an object', { clip, error, rawClip, value })
      return
    }
    const futureForm = structuredClone(form)
    futureForm.isTouched = true
    const entries = Object.entries(value)
    for (const [key, value] of entries) {
      if (typeof key !== 'string' || typeof value !== 'string' || key === '' || value === '') continue
      const actualField = futureForm.fields[key]
      if (actualField === undefined) continue // @ts-expect-error typing issue
      futureForm.fields[key] = { ...actualField, value }
    }
    setForm(futureForm)
  }, [form])

  useSignalEffect(
    useCallback(() => {
      const handler = on('focus', () => {
        checkDataInClipboard()
      })
      if (document.hasFocus()) checkDataInClipboard()
      return () => {
        off(handler)
      }
    }, [checkDataInClipboard]),
  )

  const errorMessage = parentError.length > 0 ? parentError : form.errorMessage
  const canSubmit = form.isValid && form.isTouched && errorMessage.length === 0

  return (
    <form autoComplete="off" class={`grid w-full gap-6 md:min-w-[44rem] ${gridClass(form.columns)}`} noValidate={true} onSubmit={onFormSubmit} spellcheck={false}>
      {Object.entries(form.fields).map(([id, field]) => (
        <div class={`grid w-full ${field.isVisible ? '' : 'hidden'} ${colSpanClass(field.columns)}`} key={id}>
          {field.type === 'text' && <AppFormFieldText field={field} form={form} id={id} suggestions={suggestions} updateField={updateField} />}
          {field.type === 'checkbox' && <AppFormFieldCheckbox field={field} id={id} updateField={updateField} />}
          {field.type === 'select' && <AppFormFieldSelect field={field} form={form} id={id} updateField={updateField} />}
        </div>
      ))}
      <div class="order-last flex flex-col items-center md:col-span-full">
        {Boolean(errorMessage) && Boolean(form.isTouched) && <p class="text-red-500">{errorMessage}</p>}
        {onSubmit !== undefined && (
          <Button disabled={!canSubmit} type="submit" variant="contained">
            Save
          </Button>
        )}
      </div>
    </form>
  )
}
