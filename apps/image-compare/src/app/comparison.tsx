// oxlint-disable no-magic-numbers, id-length
import { Logger } from '@monorepo/utils'
import { motion } from 'framer-motion'
import { type MouseEvent, type MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import {
  type ContestState,
  calculateNewPan,
  calculateNewZoom,
  calculateSliderPosition,
  createContestState,
  type DragStartPosition,
  defaultSliderPosition,
  fetchImageMetadata,
  getCursorType,
  getImageStyle,
  handleMultipleFilesUpload,
  handleSingleFileUpload,
  type ImageMetadata,
  isDragLeavingContainer,
  minZoom,
  selectWinner,
  shouldResetPan,
  startContest,
} from './comparison.utils'
import { ContestHeader } from './contest-header'
import { ControlButtons } from './control-buttons'
import { ImageViewer } from './image-viewer'
// oxlint-disable-next-line max-dependencies
import { SliderControl } from './slider-control'

const defaultImages = {
  after: '/sample-image-green.svg',
  before: '/sample-image-blue.svg',
}

// oxlint-disable-next-line max-lines-per-function
export function Comparison() {
  const [sliderPosition, setSliderPosition] = useState([defaultSliderPosition])
  const [leftImage, setLeftImage] = useState(defaultImages.before)
  const [rightImage, setRightImage] = useState(defaultImages.after)
  const [leftImageMetadata, setLeftImageMetadata] = useState<ImageMetadata | undefined>(undefined)
  const [rightImageMetadata, setRightImageMetadata] = useState<ImageMetadata | undefined>(undefined)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isHandleDragging, setIsHandleDragging] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [contestState, setContestState] = useState<ContestState | undefined>(undefined)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<DragStartPosition>({ panX: 0, panY: 0, x: 0, y: 0 })
  const logger = useMemo(() => new Logger(), [])

  /* v8 ignore start */
  useEffect(() => {
    if (shouldResetPan(zoom)) setPan({ x: 0, y: 0 })
  }, [zoom])

  useEffect(() => {
    const loadDefaultMetadata = async () => {
      const [leftMeta, rightMeta] = await Promise.all([fetchImageMetadata(defaultImages.before), fetchImageMetadata(defaultImages.after)])
      setLeftImageMetadata(leftMeta)
      setRightImageMetadata(rightMeta)
    }
    void loadDefaultMetadata()
  }, [])

  useEffect(() => {
    const container = imageContainerRef.current
    if (!container) return
    const handleWheelEvent = (e: globalThis.WheelEvent) => {
      e.preventDefault()
      setZoom(calculateNewZoom(zoom, e.deltaY))
    }
    container.addEventListener('wheel', handleWheelEvent, { passive: false })
    return () => container.removeEventListener('wheel', handleWheelEvent)
  }, [zoom])

  useEffect(() => {
    if (contestState?.currentMatch) {
      setLeftImage(contestState.currentMatch.leftImage.url)
      setRightImage(contestState.currentMatch.rightImage.url)
      void fetchImageMetadata(contestState.currentMatch.leftImage.url).then(setLeftImageMetadata)
      void fetchImageMetadata(contestState.currentMatch.rightImage.url).then(setRightImageMetadata)
    } else if (contestState?.isComplete && contestState.winner)
      void fetchImageMetadata(contestState.winner.url).then(metadata => {
        setLeftImageMetadata({ ...metadata, isWinner: true })
        setRightImageMetadata({ ...metadata, isWinner: false })
      })
  }, [contestState])
  /* v8 ignore stop */

  type FileInputEvent = {
    target: {
      files?: FileList | null
    }
  }

  const handleLeftImageUpload = (e: FileInputEvent): void => {
    handleSingleFileUpload(e.target.files?.[0], {
      imageSide: 'left',
      logger,
      onImageUpdate: setLeftImage,
      onMetadataUpdate: setLeftImageMetadata,
    })
  }

  const handleRightImageUpload = (e: FileInputEvent): void => {
    handleSingleFileUpload(e.target.files?.[0], {
      imageSide: 'right',
      logger,
      onImageUpdate: setRightImage,
      onMetadataUpdate: setRightImageMetadata,
    })
  }

  /* v8 ignore start */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  // oxlint-disable-next-line consistent-function-scoping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isDragLeavingContainer(e)) setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    handleMultipleFilesUpload(e.dataTransfer.files, {
      logger,
      onContestStart: images => {
        const state = createContestState(images)
        setContestState(startContest(state))
      },
      onLeftImageUpdate: setLeftImage,
      onLeftMetadataUpdate: setLeftImageMetadata,
      onRightImageUpdate: setRightImage,
      onRightMetadataUpdate: setRightImageMetadata,
    })
  }
  /* v8 ignore stop */

  const handleReset = () => {
    setSliderPosition([defaultSliderPosition])
    setZoom(minZoom)
    setPan({ x: 0, y: 0 })
    setIsPanning(false)
    setIsHandleDragging(false)
    setContestState(undefined)
    setLeftImage('/before.svg')
    setRightImage('/after.svg')
    setLeftImageMetadata(undefined)
    setRightImageMetadata(undefined)
    logger.info('Reset zoom and pan to initial positions.')
  }

  /* v8 ignore start */
  const handleSelectWinner = (winnerId: number) => {
    if (!contestState) return
    const newState = selectWinner(contestState, winnerId)
    setContestState(newState)
    if (newState.currentMatch) {
      setLeftImage(newState.currentMatch.leftImage.url)
      setRightImage(newState.currentMatch.rightImage.url)
    }
    if (newState.isComplete && newState.winner) {
      setLeftImage(newState.winner.url)
      setRightImage(newState.winner.url)
    }
  }

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

  const handleMouseDownOnHandle = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsHandleDragging(true)
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setIsHandleDragging(false)
  }

  const handleMouseLeave = () => {
    setIsPanning(false)
    setIsHandleDragging(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning && zoom > minZoom) setPan(calculateNewPan(dragStartRef.current, e.clientX, e.clientY))
    else if (isHandleDragging && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect()
      setSliderPosition([calculateSliderPosition(e.clientX, rect)])
    }
  }
  /* v8 ignore stop */

  const imageStyle = getImageStyle(pan, zoom, isPanning)
  const cursor = getCursorType(isHandleDragging, zoom, isPanning)

  return (
    <div className="bg-accent flex flex-col grow justify-center items-center p-6 h-[calc(100vh-56px)] overflow-hidden">
      <motion.div animate={{ opacity: 1, y: 0 }} className="w-full" initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.5, staggerChildren: 0.1 }}>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -10 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <ContestHeader contestState={contestState} leftImageMetadata={leftImageMetadata} rightImageMetadata={rightImageMetadata} />
        </motion.div>
        <motion.div animate={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <ImageViewer
            contestState={contestState}
            cursor={cursor}
            imageContainerRef={imageContainerRef}
            imageStyle={imageStyle}
            isDraggingOver={isDraggingOver}
            leftImage={leftImage}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseDownOnHandle={handleMouseDownOnHandle}
            onMouseDownOnImage={handleMouseDownOnImage}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onSelectWinner={handleSelectWinner}
            rightImage={rightImage}
            sliderPosition={sliderPosition}
            zoom={zoom}
          />
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <SliderControl contestState={contestState} onValueChange={setSliderPosition} value={sliderPosition} />
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <ControlButtons contestState={contestState} onLeftImageUpload={handleLeftImageUpload} onReset={handleReset} onRightImageUpload={handleRightImageUpload} />
        </motion.div>
      </motion.div>
    </div>
  )
}
