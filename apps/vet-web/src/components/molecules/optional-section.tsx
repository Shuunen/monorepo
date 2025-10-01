import { Checkbox, FormControl, FormField, FormItem, FormLabel } from '@monorepo/components'
import { type ReactElement, useEffect } from 'react'
import type { ControllerRenderProps, FieldValues, Path, UseFormReturn } from 'react-hook-form'

type OptionalSectionProps<TypeFieldValues extends FieldValues = FieldValues> = {
  form: UseFormReturn<TypeFieldValues>
  checkboxName: Path<TypeFieldValues>
  checkboxLabel: string
  checkboxTestId?: string
  conditionalFieldName: Path<TypeFieldValues>
  children: (field: ControllerRenderProps<TypeFieldValues>) => ReactElement
}

export function OptionalSection<TypeFieldValues extends FieldValues = FieldValues>({ form, checkboxName, checkboxLabel, checkboxTestId, conditionalFieldName, children }: OptionalSectionProps<TypeFieldValues>) {
  // Watch the checkbox value
  const isChecked = form.watch(checkboxName)

  // Clear the conditional field when checkbox is unchecked
  useEffect(() => {
    if (!isChecked) form.setValue(conditionalFieldName, '' as unknown as TypeFieldValues[Path<TypeFieldValues>])
  }, [isChecked, form, conditionalFieldName])

  return (
    <>
      <FormField
        control={form.control}
        name={checkboxName}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} data-testid={checkboxTestId} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{checkboxLabel}</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {isChecked && <FormField control={form.control} name={conditionalFieldName} render={fieldProps => children(fieldProps.field)} />}
    </>
  )
}
