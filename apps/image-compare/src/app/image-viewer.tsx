/** biome-ignore-all lint/a11y/noStaticElementInteractions: fix me later */
/** biome-ignore-all lint/correctness/useUniqueElementIds: fix me later */
// oxlint-disable id-length, no-magic-numbers
import { Button } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import { motion } from 'framer-motion'
import type { MouseEvent, MouseEventHandler, RefObject, WheelEvent } from 'react'
import type { ContestState, CursorType, ImageStyle } from './comparison.utils'

type ImageViewerProps = {
  contestState: ContestState | undefined
  cursor: CursorType
  imageContainerRef: RefObject<HTMLDivElement | null>
  imageStyle: ImageStyle
  isDraggingOver: boolean
  leftImage: string
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onMouseDownOnHandle: (e: MouseEvent) => void
  onMouseDownOnImage: MouseEventHandler<HTMLDivElement>
  onMouseLeave: () => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: () => void
  onSelectWinner: (winnerId: number) => void
  onWheel: (e: WheelEvent) => void
  rightImage: string
  sliderPosition: number[]
  zoom: number
}

// oxlint-disable-next-line max-lines-per-function
export function ImageViewer({
  contestState,
  cursor,
  imageContainerRef,
  imageStyle,
  isDraggingOver,
  leftImage,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onMouseDownOnHandle,
  onMouseDownOnImage,
  onMouseLeave,
  onMouseMove,
  onMouseUp,
  onSelectWinner,
  onWheel,
  rightImage,
  sliderPosition,
  zoom,
}: ImageViewerProps) {
  const isContestMode = contestState !== undefined && !contestState.isComplete
  const isContestComplete = contestState?.isComplete ?? false
  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden mb-6"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseDown={onMouseDownOnImage}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      ref={imageContainerRef}
      style={{ cursor }}
    >
      <div className={cn('absolute inset-0 bg-primary/20 border-4 border-dashed border-primary z-50 flex items-center justify-center pointer-events-none', { hidden: !isDraggingOver })}>
        <div className="bg-background/90 text-foreground px-6 py-3 rounded-lg text-lg font-semibold">Drop 2 images here</div>
      </div>
      <div className="absolute inset-0 pointer-events-none select-none">
        <img alt="right" className="w-full h-full object-cover" src={rightImage} style={imageStyle} />
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)`,
        }}
        transition={{ damping: 30, stiffness: 300, type: 'spring' }}
      >
        <img alt="left" className="w-full h-full object-cover" src={leftImage} style={imageStyle} />
      </motion.div>

      <div className={cn('absolute top-0 bottom-0 w-1 bg-primary mix-blend-difference shadow-lg cursor-ew-resize transition-colors', { hidden: isContestComplete })} onMouseDown={onMouseDownOnHandle} style={{ left: `${sliderPosition[0]}%` }} test-id="slider-bar">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing" test-id="slider-handle">
          <div className="flex gap-1">
            <div className="w-1 h-6 bg-primary-foreground rounded"></div>
            <div className="w-1 h-6 bg-primary-foreground rounded"></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-accent/50 text-accent-foreground text-xs px-2 py-1 rounded pointer-events-none">Zoom: {Math.round(zoom * 100)}%</div>
      {/* v8 ignore start -- @preserve */}
      <Button className={cn('absolute left-2 bottom-2', { hidden: !isContestMode })} name="choose-left" onClick={() => onSelectWinner(contestState?.currentMatch?.leftImage.id ?? 0)}>
        Choose Left
      </Button>
      <Button className={cn('absolute right-2 bottom-2', { hidden: !isContestMode })} name="choose-right" onClick={() => onSelectWinner(contestState?.currentMatch?.rightImage.id ?? 0)}>
        Choose Right
      </Button>
      {/* v8 ignore stop -- @preserve */}
    </div>
  )
}
