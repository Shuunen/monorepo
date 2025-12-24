// oxlint-disable no-magic-numbers, id-length
import type { Logger } from '@monorepo/utils'

export type PanPosition = { x: number; y: number }

export type DragStartPosition = { panX: number; panY: number; x: number; y: number }

export type ImageStyle = {
  transform: string
  transition: string
}

export type CursorType = 'auto' | 'grab' | 'grabbing'

export const minZoom = 1
export const maxZoom = 5
export const zoomSensitivity = 0.005
export const defaultSliderPosition = 50
export const maxPercentage = 100
export const requiredFilesCount = 2

export function calculateNewZoom(currentZoom: number, deltaY: number): number {
  const newZoom = currentZoom - deltaY * zoomSensitivity
  return Math.min(Math.max(newZoom, minZoom), maxZoom)
}

export function calculateNewPan(dragStart: DragStartPosition, clientX: number, clientY: number): PanPosition {
  const dx = clientX - dragStart.x
  const dy = clientY - dragStart.y
  return { x: dragStart.panX + dx, y: dragStart.panY + dy }
}

export function calculateSliderPosition(clientX: number, rect: DOMRect): number {
  const x = clientX - rect.left
  const newPosition = (x / rect.width) * maxPercentage
  return Math.max(0, Math.min(maxPercentage, newPosition))
}

export function getImageStyle(pan: PanPosition, zoom: number, isPanning: boolean): ImageStyle {
  return { transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }
}

export function getCursorType(isHandleDragging: boolean, zoom: number, isPanning: boolean): CursorType {
  if (isHandleDragging) return 'grabbing'
  if (zoom > minZoom) return isPanning ? 'grabbing' : 'grab'
  return 'auto'
}

export function shouldResetPan(zoom: number): boolean {
  return zoom === minZoom
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

export async function fetchImageMetadata(url: string, filename?: string): Promise<ImageMetadata> {
  const response = await fetch(url)
  const blob = await response.blob()
  const extractedFilename = filename ?? url.split('/').pop() ?? 'unknown'
  const dimensions = await getImageDimensions(url)
  return { filename: extractedFilename, height: dimensions.height, size: blob.size, width: dimensions.width }
}

function getImageDimensions(src: string): Promise<{ height: number; width: number }> {
  return new Promise((resolve, reject) => {
    const img = globalThis.document.createElement('img')
    img.addEventListener('load', () => resolve({ height: img.naturalHeight, width: img.naturalWidth }))
    img.addEventListener('error', () => reject(new Error('Failed to load image')))
    img.src = src
  })
}

export type ImageUpdateCallbacks = {
  logger: Logger
  onImageUpdate: (dataUrl: string) => void
  onMetadataUpdate?: (metadata: ImageMetadata) => void
  imageSide: 'left' | 'right'
}

export function handleSingleFileUpload(file: File | undefined, callbacks: ImageUpdateCallbacks): void {
  if (!file) return
  const { imageSide, logger, onImageUpdate, onMetadataUpdate } = callbacks
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

export type TwoImagesUpdateCallbacks = {
  logger: Logger
  onLeftImageUpdate: (dataUrl: string) => void
  onRightImageUpdate: (dataUrl: string) => void
  onLeftMetadataUpdate?: (metadata: ImageMetadata) => void
  onRightMetadataUpdate?: (metadata: ImageMetadata) => void
}

export type ImageMetadata = {
  filename: string
  size: number
  width: number
  height: number
  isWinner?: boolean
}

export type ImageData = {
  url: string
  filename: string
}

export type MultipleImagesUpdateCallbacks = {
  logger: Logger
  onContestStart: (images: ImageData[]) => void
}

function loadImagesForContest(files: FileList, callbacks: MultipleImagesUpdateCallbacks): void {
  const { logger, onContestStart } = callbacks
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

function loadTwoImages(files: FileList, callbacks: TwoImagesUpdateCallbacks): void {
  const { logger, onLeftImageUpdate, onLeftMetadataUpdate, onRightImageUpdate, onRightMetadataUpdate } = callbacks
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
    /* v8 ignore next */
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
    /* v8 ignore next */
    () => logger.showError('Failed to read second dropped file: result is not a string.'),
  )
}

export function handleMultipleFilesUpload(files: FileList, callbacks: MultipleImagesUpdateCallbacks | TwoImagesUpdateCallbacks): void {
  /* v8 ignore start -- @preserve */
  if (files.length === requiredFilesCount && 'onLeftImageUpdate' in callbacks) loadTwoImages(files, callbacks)
  else if (files.length > requiredFilesCount && 'onContestStart' in callbacks) loadImagesForContest(files, callbacks)
  else if (files.length === 1) callbacks.logger.showError('Please drop 2 or more images to compare.')
  /* v8 ignore stop -- @preserve */
}

export function isDragLeavingContainer(event: React.DragEvent): boolean {
  return event.currentTarget === event.target || !event.currentTarget.contains(event.relatedTarget as Node)
}

export type ContestImage = {
  url: string
  id: number
  eliminated: boolean
  filename: string
}

export type ContestMatch = {
  leftImage: ContestImage
  rightImage: ContestImage
  matchNumber: number
}

export type ContestState = {
  allImages: ContestImage[]
  activeImages: ContestImage[]
  currentMatch: ContestMatch | undefined
  round: number
  isComplete: boolean
  winner: ContestImage | undefined
  matchesInRound: number
  matchesCompletedInRound: number
}

export function createContestState(imageData: ImageData[]): ContestState {
  const images = imageData.map((data, index) => ({
    eliminated: false,
    filename: data.filename,
    id: index,
    url: data.url,
  }))
  return {
    activeImages: images,
    allImages: images,
    currentMatch: undefined,
    isComplete: false,
    matchesCompletedInRound: 0,
    matchesInRound: Math.floor(images.length / 2),
    round: 1,
    winner: undefined,
  }
}

export function getNextMatch(state: ContestState): ContestMatch | undefined {
  const { activeImages, matchesCompletedInRound } = state
  const pairIndex = matchesCompletedInRound * 2
  const leftImage = activeImages[pairIndex]
  const rightImage = activeImages[pairIndex + 1]
  if (leftImage && rightImage)
    return {
      leftImage,
      matchNumber: matchesCompletedInRound + 1,
      rightImage,
    }
  return undefined
}

export function selectWinner(state: ContestState, winnerId: number): ContestState {
  const loserInCurrentMatch = state.currentMatch?.leftImage.id === winnerId ? state.currentMatch.rightImage : state.currentMatch?.leftImage
  const updatedAllImages = state.allImages.map(img => (img.id === loserInCurrentMatch?.id ? { ...img, eliminated: true } : img))
  const updatedMatchesCompletedInRound = state.matchesCompletedInRound + 1
  const nextMatch = getNextMatch({ ...state, matchesCompletedInRound: updatedMatchesCompletedInRound })
  if (nextMatch)
    return {
      ...state,
      allImages: updatedAllImages,
      currentMatch: nextMatch,
      matchesCompletedInRound: updatedMatchesCompletedInRound,
    }
  const remainingImages = updatedAllImages.filter(img => !img.eliminated)
  if (remainingImages.length === 1 && remainingImages[0])
    return {
      ...state,
      activeImages: remainingImages,
      allImages: updatedAllImages,
      currentMatch: undefined,
      isComplete: true,
      matchesCompletedInRound: updatedMatchesCompletedInRound,
      winner: remainingImages[0],
    }
  const newMatchesInRound = Math.floor(remainingImages.length / 2)
  const newMatch = getNextMatch({ ...state, activeImages: remainingImages, matchesCompletedInRound: 0 })
  return {
    ...state,
    activeImages: remainingImages,
    allImages: updatedAllImages,
    currentMatch: newMatch,
    matchesCompletedInRound: 0,
    matchesInRound: newMatchesInRound,
    round: state.round + 1,
  }
}

export function startContest(state: ContestState): ContestState {
  const firstMatch = getNextMatch(state)
  return {
    ...state,
    currentMatch: firstMatch,
  }
}
