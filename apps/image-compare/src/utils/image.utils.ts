import { logger } from './logger.utils'

export const requiredFilesCount = 2

export type ImageMetadata = {
  filename: string
  size: number
  width: number
  height: number
}

export type ImageData = {
  url: string
  filename: string
}

export type ImageUpdateCallbacks = {
  onImageUpdate: (dataUrl: string) => void
  onMetadataUpdate?: (metadata: ImageMetadata) => void
  imageSide: 'left' | 'right'
}

export type TwoImagesUpdateCallbacks = {
  onLeftImageUpdate: (dataUrl: string) => void
  onRightImageUpdate: (dataUrl: string) => void
  onLeftMetadataUpdate?: (metadata: ImageMetadata) => void
  onRightMetadataUpdate?: (metadata: ImageMetadata) => void
}

export type MultipleImagesUpdateCallbacks = {
  onContestStart: (images: ImageData[]) => void
}

export function readImageFile(file: File, onSuccess: (dataUrl: string) => void, onError: (error: string) => void): void {
  const reader = new FileReader()
  // oxlint-disable-next-line prefer-add-event-listener
  reader.onload = event => {
    const result = event.target?.result
    /* v8 ignore next 2 -- @preserve */
    if (typeof result === 'string') onSuccess(result)
    else onError('Result is not a string.')
  }
  reader.readAsDataURL(file)
}

export async function fetchImageMetadata(url: string): Promise<ImageMetadata> {
  const response = await fetch(url)
  const blob = await response.blob()
  const filename = url.split('/').pop() || 'unknown'
  const dimensions = await getImageDimensions(url)
  return { filename, height: dimensions.height, size: blob.size, width: dimensions.width }
}

function getImageDimensions(src: string): Promise<{ height: number; width: number }> {
  return new Promise((resolve, reject) => {
    const img = globalThis.document.createElement('img')
    img.addEventListener('load', () => resolve({ height: img.naturalHeight, width: img.naturalWidth }))
    /* v8 ignore start */
    img.addEventListener('error', () => reject(new Error('Failed to load image')))
    /* v8 ignore stop */
    img.src = src
  })
}

export function handleSingleFileUpload(file: File | undefined, callbacks: ImageUpdateCallbacks): void {
  if (!file) return
  const { imageSide, onImageUpdate, onMetadataUpdate } = callbacks
  readImageFile(
    file,
    async dataUrl => {
      onImageUpdate(dataUrl)
      if (onMetadataUpdate) {
        const dimensions = await getImageDimensions(dataUrl)
        onMetadataUpdate({ filename: file.name, height: dimensions.height, size: file.size, width: dimensions.width })
      }
      logger.info(`${imageSide === 'left' ? 'Left' : 'Right'} image updated via upload.`)
    },
    /* v8 ignore next 3 */
    () => {
      logger.showError(`Failed to read ${imageSide} image file: result is not a string.`)
    },
  )
}

function loadImagesForContest(files: FileList, callbacks: MultipleImagesUpdateCallbacks): void {
  const { onContestStart } = callbacks
  const imageData: ImageData[] = []
  let loadedCount = 0
  const filesArray = Array.from(files)
  for (const file of filesArray)
    readImageFile(
      file,
      // oxlint-disable-next-line no-loop-func
      dataUrl => {
        imageData.push({ filename: file.name, url: dataUrl })
        loadedCount += 1
        if (loadedCount === files.length) {
          onContestStart(imageData)
          logger.info(`Contest mode started with ${files.length} images.`)
        }
      },
      /* v8 ignore next */
      () => logger.showError('Failed to read one of the dropped files.'),
    )
}

/* v8 ignore start */

function loadTwoImages(files: FileList, callbacks: TwoImagesUpdateCallbacks): void {
  const { onLeftImageUpdate, onLeftMetadataUpdate, onRightImageUpdate, onRightMetadataUpdate } = callbacks
  const [file1, file2] = Array.from(files)
  if (!file1 || !file2) return
  readImageFile(
    file1,
    async dataUrl => {
      onLeftImageUpdate(dataUrl)
      if (onLeftMetadataUpdate) {
        const dimensions = await getImageDimensions(dataUrl)
        onLeftMetadataUpdate({ filename: file1.name, height: dimensions.height, size: file1.size, width: dimensions.width })
      }
      logger.info('Left image updated via drag and drop.')
    },
    () => logger.showError('Failed to read first dropped file: result is not a string.'),
  )
  readImageFile(
    file2,
    async dataUrl => {
      onRightImageUpdate(dataUrl)
      if (onRightMetadataUpdate) {
        const dimensions = await getImageDimensions(dataUrl)
        onRightMetadataUpdate({ filename: file2.name, height: dimensions.height, size: file2.size, width: dimensions.width })
      }
      logger.info('Right image updated via drag and drop.')
    },
    () => logger.showError('Failed to read second dropped file: result is not a string.'),
  )
}

export function handleMultipleFilesUpload(files: FileList, callbacks: MultipleImagesUpdateCallbacks | TwoImagesUpdateCallbacks): void {
  if (files.length === requiredFilesCount && 'onLeftImageUpdate' in callbacks) loadTwoImages(files, callbacks)
  else if (files.length > requiredFilesCount && 'onContestStart' in callbacks) loadImagesForContest(files, callbacks)
  else if (files.length === 1) logger.showError('Please drop 2 or more images to compare.')
}

export function isDragLeavingContainer(event: React.DragEvent): boolean {
  return event.currentTarget === event.target || !event.currentTarget.contains(event.relatedTarget as Node)
}
/* v8 ignore stop */

export function getContainedSize(params: { imageHeight: number; imageWidth: number; maxHeight: number; maxWidth: number }) {
  const { imageWidth, imageHeight, maxWidth, maxHeight } = params
  const aspectRatio = imageWidth / imageHeight
  const maxAspectRatio = maxWidth / maxHeight
  if (aspectRatio > maxAspectRatio) return { height: maxWidth / aspectRatio, width: maxWidth }
  return { height: Math.round(maxHeight), width: Math.round(maxHeight * aspectRatio) }
}
