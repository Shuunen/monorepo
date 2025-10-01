import type { CodeVersion, CodeVersionLabel } from '../../utils/cvl.types'
import type { Option } from '../../utils/form.types'
import { logger } from '../../utils/logger.utils'

export type PropsOption = Option | CodeVersionLabel
export type SelectValue = string | CodeVersion
export type SelectValues = SelectValue | SelectValue[]

function isCodeVersion(value: unknown): value is CodeVersion {
  return typeof value === 'object' && value !== null && 'Code' in value && 'Version' in value
}

function isStringValue(value: unknown): value is string {
  return typeof value === 'string'
}

export function isEqual(valueA: unknown, valueB: unknown): boolean {
  if (isStringValue(valueA) && isStringValue(valueB)) return valueA === valueB
  if (isCodeVersion(valueA) && isCodeVersion(valueB)) return valueA.Code === valueB.Code && valueA.Version === valueB.Version
  return false
}

export function getOptionValue(option: PropsOption): SelectValue {
  // biome-ignore lint/style/useNamingConvention: can't fix
  return 'value' in option ? option.value : { Code: option.Code, Version: option.Version }
}

type HandleSelectOptions = {
  option: PropsOption
  fieldValue: SelectValues
  form: { setValue: (name: string, value: SelectValues) => void }
  name: string
  multiple?: boolean
}

export function handleSelect({ option, fieldValue, form, name, multiple }: HandleSelectOptions): boolean {
  const newValue = getOptionValue(option)
  if (multiple) {
    const currentValue = Array.isArray(fieldValue) ? fieldValue : []
    const valueExists = currentValue.some(value => isEqual(value, newValue))
    const updatedValue = valueExists ? currentValue.filter(value => !isEqual(value, newValue)) : [...currentValue, newValue]
    form.setValue(name, updatedValue)
    logger.info(`Toggled ${name}:`, updatedValue)
  } else {
    form.setValue(name, newValue)
    logger.info(`Selected ${name}:`, newValue)
  }
  return !multiple
}

export function isOptionSelected(option: PropsOption, value?: SelectValues) {
  if (!value) return false
  const optionValue = getOptionValue(option)
  if (Array.isArray(value)) return value.some(val => isEqual(val, optionValue))
  return isEqual(value, optionValue)
}
