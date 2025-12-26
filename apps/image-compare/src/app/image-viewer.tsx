/** biome-ignore-all lint/a11y/noStaticElementInteractions: fix me later */
/** biome-ignore-all lint/correctness/useUniqueElementIds: fix me later */
// oxlint-disable id-length, no-magic-numbers
import { Button } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import { motion } from 'framer-motion'
import type { MouseEvent, MouseEventHandler, RefObject } from 'react'
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
  rightImage,
  sliderPosition,
  zoom,
}: ImageViewerProps) {
  const isContestMode = contestState !== undefined && !contestState.isComplete
  const isContestComplete = contestState?.isComplete ?? false
  return (
    <div
      className="relative h-[calc(100vh-382px)] rounded-xl overflow-hidden mb-8"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseDown={onMouseDownOnImage}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      ref={imageContainerRef}
      style={{ cursor }}
    >
      <motion.div
        animate={{ opacity: isDraggingOver ? 1 : 0 }}
        className="absolute inset-0 bg-primary/20 border-4 border-dashed border-primary z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        style={{ display: isDraggingOver ? 'flex' : 'none' }}
        transition={{ duration: 0.2 }}
      >
        <motion.div animate={{ scale: isDraggingOver ? 1 : 0.9 }} className="bg-background/90 text-foreground px-6 py-3 rounded-lg text-lg font-semibold" initial={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
          Drop 2 images here
        </motion.div>
      </motion.div>
      <motion.div animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none select-none" initial={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <img alt="right" className="w-full h-full object-cover" src={rightImage} style={imageStyle} />
      </motion.div>

      <motion.div
        animate={{ opacity: 1 }}
        className="absolute inset-0 pointer-events-none select-none"
        initial={{ opacity: 0 }}
        style={{
          clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)`,
        }}
        transition={{ damping: 30, opacity: { duration: 0.3 }, stiffness: 300, type: 'spring' }}
      >
        <img alt="left" className="w-full h-full object-cover" src={leftImage} style={imageStyle} />
      </motion.div>

      <motion.div
        animate={{ opacity: isContestComplete ? 0 : 1 }}
        className={cn('absolute top-0 bottom-0 w-1 bg-primary mix-blend-difference shadow-lg cursor-ew-resize transition-colors', { hidden: isContestComplete })}
        initial={{ opacity: 0 }}
        onMouseDown={onMouseDownOnHandle}
        style={{ left: `${sliderPosition[0]}%` }}
        test-id="slider-bar"
        transition={{ duration: 0.2 }}
      >
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing" test-id="slider-handle" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <div className="flex gap-1">
            <div className="w-1 h-6 bg-primary-foreground rounded"></div>
            <div className="w-1 h-6 bg-primary-foreground rounded"></div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div animate={{ opacity: 1, scale: 1 }} className="absolute bottom-2 right-2 bg-accent/50 text-accent-foreground text-xs px-2 py-1 rounded pointer-events-none" initial={{ opacity: 0, scale: 0.8 }} transition={{ delay: 0.2, duration: 0.3 }}>
        Zoom: {Math.round(zoom * 100)}%
      </motion.div>
      {/* v8 ignore start -- @preserve */}
      <motion.div animate={{ opacity: isContestMode ? 1 : 0, y: isContestMode ? 0 : 20 }} className={cn('absolute left-2 bottom-2', { hidden: !isContestMode })} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
        <Button name="choose-left" onClick={() => onSelectWinner(contestState?.currentMatch?.leftImage.id ?? 0)}>
          Choose Left
        </Button>
      </motion.div>
      <motion.div animate={{ opacity: isContestMode ? 1 : 0, y: isContestMode ? 0 : 20 }} className={cn('absolute right-2 bottom-2', { hidden: !isContestMode })} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
        <Button name="choose-right" onClick={() => onSelectWinner(contestState?.currentMatch?.rightImage.id ?? 0)}>
          Choose Right
        </Button>
      </motion.div>
      {/* v8 ignore stop -- @preserve */}
    </div>
  )
}
