import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'

export type FieldBaseProps<TypeFieldValues extends FieldValues = FieldValues> = {
  /** the label above the field */
  label?: string
  // biome-ignore lint/suspicious/noExplicitAny: we need that
  form: UseFormReturn<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  /** the name of the field */
  name: FieldPath<TypeFieldValues>
  /** will show a red star if the label is defined */
  isRequired: boolean
  /** used for data-testid */
  testId: string
  placeholder?: string
  /** disable the N/A checkbox */
  disableNa?: boolean
}

/** The type of an option in a select or radio field */
export type Option = {
  /** the label of the option */
  label: string
  /** the value of the option */
  value: string
}
