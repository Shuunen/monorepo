// oxlint-disable no-magic-numbers, id-length
import { Logger } from '@monorepo/utils'
import { type MouseEvent, type MouseEventHandler, useEffect, useRef, useState, type WheelEvent } from 'react'
import {
  type ContestState,
  calculateNewPan,
  calculateNewZoom,
  calculateSliderPosition,
  createContestState,
  type DragStartPosition,
  defaultSliderPosition,
  getCursorType,
  getImageStyle,
  handleMultipleFilesUpload,
  handleSingleFileUpload,
  isDragLeavingContainer,
  minZoom,
  selectWinner,
  shouldResetPan,
  startContest,
} from './comparison.utils'
import { ContestHeader } from './contest-header'
import { ControlButtons } from './control-buttons'
import { ImageViewer } from './image-viewer'
import { SliderControl } from './slider-control'

// oxlint-disable-next-line max-lines-per-function
export function Comparison() {
  const [sliderPosition, setSliderPosition] = useState([defaultSliderPosition])
  const [leftImage, setLeftImage] = useState('/before.svg')
  const [rightImage, setRightImage] = useState('/after.svg')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isHandleDragging, setIsHandleDragging] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [contestState, setContestState] = useState<ContestState | undefined>(undefined)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<DragStartPosition>({ panX: 0, panY: 0, x: 0, y: 0 })

  useEffect(() => {
    if (shouldResetPan(zoom)) setPan({ x: 0, y: 0 })
  }, [zoom])

  useEffect(() => {
    /* c8 ignore start */
    if (contestState?.currentMatch) {
      setLeftImage(contestState.currentMatch.leftImage.url)
      setRightImage(contestState.currentMatch.rightImage.url)
    }
    /* c8 ignore stop */
  }, [contestState])

  type FileInputEvent = {
    target: {
      files?: FileList | null
    }
  }

  const logger = new Logger()

  const handleLeftImageUpload = (e: FileInputEvent): void => {
    handleSingleFileUpload(e.target.files?.[0], {
      imageSide: 'left',
      logger,
      onImageUpdate: setLeftImage,
    })
  }

  const handleRightImageUpload = (e: FileInputEvent): void => {
    handleSingleFileUpload(e.target.files?.[0], {
      imageSide: 'right',
      logger,
      onImageUpdate: setRightImage,
    })
  }

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
    /* c8 ignore start */
    if (isDragLeavingContainer(e)) setIsDraggingOver(false)
    /* c8 ignore stop */
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
      onRightImageUpdate: setRightImage,
    })
  }

  const handleReset = () => {
    setSliderPosition([defaultSliderPosition])
    setZoom(minZoom)
    setPan({ x: 0, y: 0 })
    setIsPanning(false)
    setIsHandleDragging(false)
    setContestState(undefined)
    setLeftImage('/before.svg')
    setRightImage('/after.svg')
    logger.info('Reset zoom and pan to initial positions.')
  }

  /* c8 ignore start */
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
  /* c8 ignore stop */

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    setZoom(calculateNewZoom(zoom, e.deltaY))
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

  const imageStyle = getImageStyle(pan, zoom, isPanning)
  const cursor = getCursorType(isHandleDragging, zoom, isPanning)

  return (
    <div className="bg-accent flex flex-col grow justify-center items-center pt-5 pb-12">
      <div className="w-full max-w-4xl">
        <ContestHeader contestState={contestState} />
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
          onWheel={handleWheel}
          rightImage={rightImage}
          sliderPosition={sliderPosition}
          zoom={zoom}
        />
        <SliderControl contestState={contestState} onValueChange={setSliderPosition} value={sliderPosition} />
        <ControlButtons contestState={contestState} onLeftImageUpload={handleLeftImageUpload} onReset={handleReset} onRightImageUpload={handleRightImageUpload} />
      </div>
    </div>
  )
}
