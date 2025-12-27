// oxlint-disable no-magic-numbers, id-length, max-dependencies, max-lines
import { Logger } from '@monorepo/utils'
import { motion } from 'framer-motion'
import { type MouseEvent, type MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import { ContestHeader } from '../components/contest-header'
import { ControlButtons } from '../components/control-buttons'
import { ImageViewer } from '../components/image-viewer'
import { SliderControl } from '../components/slider-control'
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
  getNbFiles,
  handleMultipleFilesUpload,
  handleSingleFileUpload,
  type ImageMetadata,
  isDragLeavingContainer,
  minHeight,
  minWidth,
  minZoom,
  selectWinner,
  shouldResetPan,
  startContest,
} from '../utils/comparison.utils'
import { getContainedSize } from '../utils/image.utils'

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
  const [nbDraggedFiles, setNbDraggedFiles] = useState(0)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
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
      const metadata = leftImageMetadata || rightImageMetadata
      if (!metadata?.width || !metadata?.height) {
        setZoom(calculateNewZoom(zoom, e.deltaY))
        return
      }
      const maxWidth = window.innerWidth - 48
      const maxHeight = window.innerHeight - 382
      const containedSize = getContainedSize({ imageHeight: metadata.height, imageWidth: metadata.width, maxHeight, maxWidth })
      const newZoom = calculateNewZoom(zoom, e.deltaY)
      const wouldBeWidth = containedSize.width * newZoom
      const wouldBeHeight = containedSize.height * newZoom
      if (wouldBeWidth >= minWidth || wouldBeHeight >= minHeight) setZoom(newZoom)
    }
    container.addEventListener('wheel', handleWheelEvent, { passive: false })
    return () => container.removeEventListener('wheel', handleWheelEvent)
  }, [zoom, leftImageMetadata, rightImageMetadata])

  useEffect(() => {
    if (contestState?.currentMatch) {
      setLeftImage(contestState.currentMatch.leftImage.url)
      setRightImage(contestState.currentMatch.rightImage.url)
      void fetchImageMetadata(contestState.currentMatch.leftImage.url).then(metadata => {
        setLeftImageMetadata({ ...metadata, filename: contestState.currentMatch?.leftImage.filename ?? metadata.filename })
      })
      void fetchImageMetadata(contestState.currentMatch.rightImage.url).then(metadata => {
        setRightImageMetadata({ ...metadata, filename: contestState.currentMatch?.rightImage.filename ?? metadata.filename })
      })
    }
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
    setNbDraggedFiles(getNbFiles(e.nativeEvent))
  }

  // oxlint-disable-next-line consistent-function-scoping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingLeft(e.clientX < window.innerWidth / 2)
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
    const files = e.dataTransfer.files
    if (files.length === 1) {
      const file = files[0]
      if (isDraggingLeft)
        handleSingleFileUpload(file, {
          imageSide: 'left',
          logger,
          onImageUpdate: setLeftImage,
          onMetadataUpdate: setLeftImageMetadata,
        })
      else
        handleSingleFileUpload(file, {
          imageSide: 'right',
          logger,
          onImageUpdate: setRightImage,
          onMetadataUpdate: setRightImageMetadata,
        })
      return
    }
    handleMultipleFilesUpload(files, {
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
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setIsPanning(false)
    setIsHandleDragging(false)
    setContestState(undefined)
    setLeftImageMetadata({ filename: leftImageMetadata?.filename ?? 'lost-filename', height: leftImageMetadata?.height ?? 0, isWinner: undefined, size: leftImageMetadata?.size ?? 0, width: leftImageMetadata?.width ?? 0 })
    setRightImageMetadata({ filename: rightImageMetadata?.filename ?? 'lost-filename', height: rightImageMetadata?.height ?? 0, isWinner: undefined, size: rightImageMetadata?.size ?? 0, width: rightImageMetadata?.width ?? 0 })
    logger.info('Reset zoom and pan to initial positions.')
  }

  /* v8 ignore start */
  const handleSelectWinner = (winnerId: number) => {
    if (!contestState) return
    const newState = selectWinner(contestState, winnerId)
    setContestState(newState)
    if (newState.isComplete && newState.winner) {
      const winnerFilename = newState.winner.filename
      setLeftImageMetadata({ filename: leftImageMetadata?.filename ?? 'lost-filename', height: leftImageMetadata?.height ?? 0, isWinner: leftImageMetadata?.filename === winnerFilename, size: leftImageMetadata?.size ?? 0, width: leftImageMetadata?.width ?? 0 })
      setRightImageMetadata({ filename: rightImageMetadata?.filename ?? 'lost-filename', height: rightImageMetadata?.height ?? 0, isWinner: rightImageMetadata?.filename === winnerFilename, size: rightImageMetadata?.size ?? 0, width: rightImageMetadata?.width ?? 0 })
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

  const handleMouseUpOrLeave = () => {
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

  const imageStyle = getImageStyle(pan, zoom, isPanning)
  const cursor = getCursorType(isHandleDragging, zoom, isPanning)

  // Calculate dynamic width and height based on image dimensions with object-contain behavior
  const { containerWidth, containerHeight } = useMemo(() => {
    const metadata = leftImageMetadata || rightImageMetadata
    if (!metadata?.width || !metadata?.height) return { containerHeight: 'auto', containerWidth: '100%' }
    const maxWidth = window.innerWidth - 48
    const maxHeight = window.innerHeight - 382
    const containedSize = getContainedSize({ imageHeight: metadata.height, imageWidth: metadata.width, maxHeight, maxWidth })
    const zoomedWidth = Math.round(containedSize.width * zoom)
    const zoomedHeight = Math.round(containedSize.height * zoom)
    return {
      containerHeight: Math.max(Math.min(zoomedHeight, maxHeight), minHeight),
      containerWidth: Math.max(Math.min(zoomedWidth, maxWidth), minWidth),
    }
  }, [leftImageMetadata, rightImageMetadata, zoom])
  /* v8 ignore stop */

  return (
    <div className="bg-accent flex flex-col grow justify-center items-center p-6 h-[calc(100vh-56px)] overflow-hidden" data-testid="comparison-tab">
      <motion.div animate={{ opacity: 1, width: containerWidth, y: 0 }} className="flex flex-col" initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.5, staggerChildren: 0.1, width: { duration: 0.3, ease: 'easeInOut' } }}>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -10 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <ContestHeader contestState={contestState} leftImageMetadata={leftImageMetadata} rightImageMetadata={rightImageMetadata} />
        </motion.div>
        <motion.div animate={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <ImageViewer
            containerHeight={containerHeight}
            contestState={contestState}
            cursor={cursor}
            imageContainerRef={imageContainerRef}
            imageStyle={imageStyle}
            isDraggingLeft={isDraggingLeft}
            isDraggingOver={isDraggingOver}
            leftImage={leftImage}
            nbDraggedFiles={nbDraggedFiles}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseDownOnHandle={handleMouseDownOnHandle}
            onMouseDownOnImage={handleMouseDownOnImage}
            onMouseLeave={handleMouseUpOrLeave}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onSelectWinner={handleSelectWinner}
            rightImage={rightImage}
            sliderPosition={sliderPosition}
            zoom={zoom}
          />
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <SliderControl onValueChange={setSliderPosition} value={sliderPosition} />
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <ControlButtons contestState={contestState} onLeftImageUpload={handleLeftImageUpload} onReset={handleReset} onRightImageUpload={handleRightImageUpload} />
        </motion.div>
      </motion.div>
    </div>
  )
}
