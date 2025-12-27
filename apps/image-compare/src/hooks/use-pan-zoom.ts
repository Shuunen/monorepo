// oxlint-disable max-lines-per-function, max-nested-callbacks, no-magic-numbers, id-length, no-nested-ternary
import { type MouseEvent, type MouseEventHandler, type RefObject, useEffect, useRef, useState } from 'react'
import { calculateNewPan, calculateNewZoom, type DragStartPosition, headerAndControlsHeight, minHeight, minWidth, minZoom, type PanPosition, padding, shouldResetPan } from '../utils/comparison.utils'
import { getContainedSize, type ImageMetadata } from '../utils/image.utils'

type UsePanZoomReturn = {
  cursor: 'auto' | 'grab' | 'grabbing'
  handleMouseDownOnImage: MouseEventHandler<HTMLDivElement>
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUpOrLeave: () => void
  imageStyle: {
    transform: string
    transition: string
  }
  isPanning: boolean
  pan: PanPosition
  setPan: (pan: PanPosition) => void
  setZoom: (zoom: number) => void
  zoom: number
}

export function usePanZoom(imageContainerRef: RefObject<HTMLDivElement | null>, leftImageMetadata: ImageMetadata | undefined, rightImageMetadata: ImageMetadata | undefined): UsePanZoomReturn {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<PanPosition>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const dragStartRef = useRef<DragStartPosition>({ panX: 0, panY: 0, x: 0, y: 0 })

  useEffect(() => {
    if (shouldResetPan(zoom)) setPan({ x: 0, y: 0 })
  }, [zoom])

  useEffect(() => {
    const container = imageContainerRef.current
    if (!container) return
    const handleWheelEvent = (e: globalThis.WheelEvent) => {
      e.preventDefault()
      const metadata = leftImageMetadata || rightImageMetadata
      if (!metadata?.width || !metadata?.height) {
        setZoom(calculateNewZoom(zoom, e.deltaY))
        return
      }
      const maxWidth = window.innerWidth - padding
      const maxHeight = window.innerHeight - headerAndControlsHeight
      const containedSize = getContainedSize({ imageHeight: metadata.height, imageWidth: metadata.width, maxHeight, maxWidth })
      const newZoom = calculateNewZoom(zoom, e.deltaY)
      const wouldBeWidth = containedSize.width * newZoom
      const wouldBeHeight = containedSize.height * newZoom
      if (wouldBeWidth >= minWidth || wouldBeHeight >= minHeight) setZoom(newZoom)
    }
    container.addEventListener('wheel', handleWheelEvent, { passive: false })
    return () => container.removeEventListener('wheel', handleWheelEvent)
  }, [zoom, leftImageMetadata, rightImageMetadata, imageContainerRef])

  const handleMouseDownOnImage: MouseEventHandler<HTMLDivElement> = e => {
    if (zoom <= minZoom) return
    e.preventDefault()
    dragStartRef.current = {
      panX: pan.x,
      panY: pan.y,
      x: e.clientX,
      y: e.clientY,
    }
    setIsPanning(true)
  }

  const handleMouseUpOrLeave = () => {
    setIsPanning(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning && zoom > minZoom) setPan(calculateNewPan(dragStartRef.current, e.clientX, e.clientY))
  }

  const imageStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
  }

  const cursor = zoom > minZoom ? (isPanning ? 'grabbing' : 'grab') : 'auto'

  return {
    cursor,
    handleMouseDownOnImage,
    handleMouseMove,
    handleMouseUpOrLeave,
    imageStyle,
    isPanning,
    pan,
    setPan,
    setZoom,
    zoom,
  }
}
