import { copyToClipboard, debounce, functionReturningVoid, objectSerialize, off, on, parseJson, Result, readClipboard } from '@monorepo/utils'
import Button from '@mui/material/Button'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { alignClipboard, type Form, updateForm, validateForm } from '../utils/forms.utils'
import { logger } from '../utils/logger.utils'
import { colSpanClass, gridClass } from '../utils/theme.utils'
import { AppFormFieldCheckbox } from './app-form-field-checkbox'
import { AppFormFieldSelect } from './app-form-field-select'
import { AppFormFieldText } from './app-form-field-text'

type Properties<FormType extends Form> = Readonly<{
  children?: ReactNode
  error?: string
  initialForm: FormType
  onChange?: (form: FormType) => void
  onSubmit?: ((form: FormType) => void) | undefined
  suggestions?: Record<string, string[]>
}>

// oxlint-disable-next-line max-lines-per-function
export function AppForm<FormType extends Form>({ children, error: parentError = '', initialForm, onChange = functionReturningVoid, onSubmit = undefined, suggestions = {} }: Properties<FormType>) {
  const [form, setForm] = useState(initialForm)

  const { hasChanged, updatedForm } = validateForm(form)
  if (hasChanged) {
    onChange(updatedForm)
    setForm(updatedForm)
  }

  const onFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      onSubmit?.(form)
    },
    [form, onSubmit],
  )

  function updateFieldSync(field: string, target: EventTarget | null, isFromClipboard = false) {
    if (target === null) return Result.error(`target for field "${field}" is null`)
    const input = target as HTMLInputElement
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

  const checkDataInClipboard = useCallback(async () => {
    const rawClip = await readClipboard()
    if (!rawClip.ok) return Result.error(`error reading clipboard : ${rawClip.error}`)
    if (rawClip.value === '') return Result.ok('clipboard is empty')
    const clip = alignClipboard(rawClip.value)
    const { error, value } = Result.unwrap(parseJson(clip))
    if (error || typeof value !== 'object' || value === null) return Result.error(`error parsing clipboard data : ${objectSerialize({ clip, error, rawClip, value })}`)
    const { hasChanged, updatedForm } = updateForm(form, value)
    if (!hasChanged) return Result.ok('no changes made')
    setForm(updatedForm)
    void copyToClipboard({})
    return Result.ok('form updated from clipboard')
  }, [form])

  useEffect(() => {
    // oxlint-disable-next-line max-nested-callbacks
    const handler = on('focus', () => checkDataInClipboard().then(result => logger.result('clipboard data checked on focus', result)))
    if (document.hasFocus()) checkDataInClipboard().then(result => logger.result('clipboard data checked on initial focus', result))
    return () => off(handler)
  }, [checkDataInClipboard])

  const errorMessage = parentError.length > 0 ? parentError : form.errorMessage
  const canSubmit = form.isValid && form.isTouched && errorMessage.length === 0

  return (
    <form autoComplete="off" className={`grid w-full gap-6 md:min-w-176 ${gridClass(form.columns)}`} noValidate={true} onSubmit={onFormSubmit} spellCheck={false}>
      {Object.entries(form.fields).map(([id, field]) => (
        <div className={`grid w-full ${field.isVisible ? '' : 'hidden'} ${colSpanClass(field.columns)}`} key={id}>
          {field.type === 'text' && <AppFormFieldText field={field} form={form} id={id} suggestions={suggestions} updateField={updateField} />}
          {field.type === 'checkbox' && <AppFormFieldCheckbox field={field} id={id} updateField={updateField} />}
          {field.type === 'select' && <AppFormFieldSelect field={field} form={form} id={id} updateField={updateField} />}
        </div>
      ))}
      <div className="order-last flex justify-center md:col-span-full">
        {Boolean(errorMessage) && Boolean(form.isTouched) && <p className="text-red-500">{errorMessage}</p>}
        {onSubmit !== undefined && (
          <Button disabled={!canSubmit} type="submit" variant="contained">
            Save
          </Button>
        )}
        {children}
      </div>
    </form>
  )
}
