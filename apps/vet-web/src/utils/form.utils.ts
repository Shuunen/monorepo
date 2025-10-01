import { debounce } from 'es-toolkit'
import { useEffect } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { z } from 'zod/v4'
import type { Option } from './form.types.ts'

/**
 * useFormPersist is a custom hook that subscribes to form value changes
 * and calls a callback function with the current form values.
 *
 * @param form - The form object from react-hook-form.
 * @param callback - A function that takes the form values
 */
export function useFormChangeDetector<InputValues extends FieldValues>(form: UseFormReturn<InputValues>, callback: (values: InputValues) => void) {
  /* c8 ignore start */
  // eslint-disable-next-line no-magic-numbers
  const debouncedCallback = debounce(callback, 300)
  useEffect(() => {
    // eslint-disable-next-line max-nested-callbacks
    const subscription = form.watch(values => {
      debouncedCallback(structuredClone(values as InputValues))
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [form, debouncedCallback])
  /* c8 ignore end */
}

export function optionToSchema<Type extends Option>(list: Type[]) {
  return z.enum<Type['value'][]>(list.map(option => option.value))
}
