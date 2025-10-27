import { isTestEnvironment } from '@monorepo/utils'
import { z } from 'zod'

const bytesInKb = 1024
const bytesInMb = bytesInKb * bytesInKb
const decimalPrecisionLimit = 10
const oneSecond = 1000
const twoSeconds = 2000
const fileExtensionRegex = /\.([^.]+)$/

export const uploadDurationFail = /* c8 ignore next */ isTestEnvironment() ? 1 : oneSecond // ms
export const uploadDurationSuccess = /* c8 ignore next */ isTestEnvironment() ? 1 : twoSeconds // ms
export const uploadPercentFail = 61 // %
export const maxPercent = 100
export const emptyFile = new File([], '')

export function formatFileSize(bytes: number, addUnit = true): string {
  const formatValue = (value: number, unit: string) => {
    const rounded = Math.round(value * decimalPrecisionLimit) / decimalPrecisionLimit
    const formatted = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)
    return `${formatted}${addUnit ? ` ${unit}` : ''}`
  }
  if (bytes < bytesInKb) return formatValue(bytes, 'B')
  if (bytes < bytesInMb) return formatValue(bytes / bytesInKb, 'KB')
  return formatValue(bytes / bytesInMb, 'MB')
}

// oxlint-disable-next-line max-lines-per-function
export function fileSchema(extensions: readonly string[], isRequired: boolean) {
  return (
    z
      .file()
      // oxlint-disable-next-line max-lines-per-function
      .check(ctx => {
        if (!isRequired && ctx.value.name === '') return
        if (isRequired && ctx.value.name === '') {
          ctx.issues.push({
            code: 'custom',
            continue: false,
            input: ctx.value,
            message: 'File is required',
          })
          return
        }
        const ext = fileExtensionRegex.exec(ctx.value.name)?.[1]?.toLowerCase() ?? ''
        if (ext === '') {
          ctx.issues.push({
            code: 'custom',
            continue: false,
            input: ctx.value,
            message: 'File has no extension',
          })
          return
        }
        if (!extensions.includes(ext.toLowerCase()))
          ctx.issues.push({
            code: 'custom',
            continue: false,
            input: ctx.value,
            message: `File extension not allowed, accepted : ${extensions.join(', ')}`,
          })
      })
  )
}

export const imageExtensions = ['jpg', 'jpeg', 'png', 'pdf'] as const
export const imageAccept = `.${imageExtensions.join(',.')}`
export const imageSchemaRequired = fileSchema(imageExtensions, true)
export const imageSchemaOptional = fileSchema(imageExtensions, false)
