// oxlint-disable no-magic-numbers, id-length
import { Logger } from '@monorepo/utils'
import { motion } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { ContestHeader } from '../components/contest-header'
import { ControlButtons } from '../components/control-buttons'
import { ImageViewer } from '../components/image-viewer'
import { SliderControl } from '../components/slider-control'
import { useContestMode } from '../hooks/use-contest-mode'
import { useDragDrop } from '../hooks/use-drag-drop'
import { useImageState } from '../hooks/use-image-state'
import { usePanZoom } from '../hooks/use-pan-zoom'
import { useSlider } from '../hooks/use-slider'
import { createContestState, defaultSliderPosition, headerAndControlsHeight, minHeight, minWidth, padding, startContest } from '../utils/comparison.utils'
import { getContainedSize } from '../utils/image.utils'

// oxlint-disable-next-line max-lines-per-function
export function Comparison() {
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const logger = useMemo(() => new Logger(), [])

  const { leftImage, leftImageMetadata, rightImage, rightImageMetadata, setLeftImage, setLeftImageMetadata, setRightImage, setRightImageMetadata } = useImageState()

  const { cursor, handleMouseDownOnImage, handleMouseMove: panMouseMove, handleMouseUpOrLeave: panMouseUpOrLeave, imageStyle, isPanning, setPan, setZoom, zoom } = usePanZoom(imageContainerRef, leftImageMetadata, rightImageMetadata)

  const { handleMouseDownOnHandle, handleMouseMove: sliderMouseMove, handleMouseUpOrLeave: sliderMouseUpOrLeave, setSliderPosition, sliderPosition } = useSlider(imageContainerRef)

  const { contestState, handleSelectWinner, setContestState } = useContestMode({
    onLeftImageUpdate: setLeftImage,
    onLeftMetadataUpdate: setLeftImageMetadata,
    onRightImageUpdate: setRightImage,
    onRightMetadataUpdate: setRightImageMetadata,
  })

  /* v8 ignore start */
  const { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleLeftImageUpload, handleRightImageUpload, isDraggingLeft, isDraggingOver, nbDraggedFiles } = useDragDrop({
    onContestStart: images => {
      const state = createContestState(images)
      setContestState(startContest(state))
    },
    onLeftImageUpdate: setLeftImage,
    onLeftMetadataUpdate: setLeftImageMetadata,
    onRightImageUpdate: setRightImage,
    onRightMetadataUpdate: setRightImageMetadata,
  })

  const handleReset = () => {
    logger.info('handleReset : resetting zoom, pan, and contest state.')
    setSliderPosition([defaultSliderPosition])
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setContestState(undefined)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    panMouseMove(event)
    sliderMouseMove(event, isPanning)
  }

  const handleMouseUpOrLeave = () => {
    panMouseUpOrLeave()
    sliderMouseUpOrLeave()
  }

  const handleSelectWinnerWrapper = (winnerId: number) => {
    logger.info(`handleSelectWinnerWrapper : user selected image with ID ${winnerId} as winner.`)
    handleSelectWinner(winnerId)
  }

  // Calculate dynamic width and height based on image dimensions with object-contain behavior
  const { containerWidth, containerHeight } = useMemo(() => {
    const metadata = leftImageMetadata || rightImageMetadata
    if (!metadata?.width || !metadata?.height) return { containerHeight: 'auto', containerWidth: '100%' }
    const maxWidth = window.innerWidth - padding
    const maxHeight = window.innerHeight - headerAndControlsHeight
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
            onSelectWinner={handleSelectWinnerWrapper}
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
