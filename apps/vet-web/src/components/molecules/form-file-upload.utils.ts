import { z } from 'zod/v4'

const bytesInKb = 1024
const bytesInMb = bytesInKb * bytesInKb
const decimalPrecisionLimit = 10

export const uploadDurationFail = 1000 // ms

export const uploadPercentFail = 61 // %

export const uploadDurationSuccess = 2000 // ms

export const maxPercent = 100

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

const documentExtensions = ['pdf', 'doc', 'docx', 'txt']
export const documentAccept = `.${documentExtensions.join(',.')}`

// oxlint-disable-next-line max-lines-per-function
export const documentFileSchema = z.file().check(ctx => {
  if (ctx.value.name === '') {
    ctx.issues.push({
      code: 'custom',
      continue: false,
      input: ctx.value,
      message: 'File is required',
    })
    return
  }
  // biome-ignore lint/performance/useTopLevelRegex: fix later
  const ext = /\.([^.]+)$/.exec(ctx.value.name)?.[1]?.toLowerCase() || ''
  if (ext === '') {
    ctx.issues.push({
      code: 'custom',
      continue: false,
      input: ctx.value,
      message: 'File has no extension',
    })
    return
  }
  if (!documentExtensions.includes(ext))
    ctx.issues.push({
      code: 'custom',
      continue: false,
      input: ctx.value,
      message: `File extension not allowed, accepted : ${documentExtensions.join(', ')}`,
    })
})
