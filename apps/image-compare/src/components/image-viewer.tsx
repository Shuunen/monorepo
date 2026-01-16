/** biome-ignore-all lint/a11y/noStaticElementInteractions: fix me later */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: fix me later  */
/** biome-ignore-all lint/correctness/useUniqueElementIds: fix me later */
// oxlint-disable id-length, no-magic-numbers
import { Button } from "@monorepo/components";
import { cn } from "@monorepo/utils";
import { motion } from "framer-motion";
import type { MouseEvent, MouseEventHandler, RefObject } from "react";
import type { ContestState, CursorType, ImageStyle } from "../utils/comparison.utils";

type ImageViewerProps = {
  containerHeight: number | string;
  contestState: ContestState | undefined;
  cursor: CursorType;
  imageContainerRef: RefObject<HTMLDivElement | null>;
  imageStyle: ImageStyle;
  isDraggingLeft: boolean;
  isDraggingOver: boolean;
  leftImage: string;
  nbDraggedFiles: number;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onMouseDownOnHandle: (e: MouseEvent) => void;
  onMouseDownOnImage: MouseEventHandler<HTMLDivElement>;
  onMouseLeave: () => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: () => void;
  onSelectWinner: (winnerId: number) => void;
  rightImage: string;
  sliderPosition: number[];
  zoom: number;
};

// oxlint-disable-next-line max-lines-per-function
export function ImageViewer({
  containerHeight,
  contestState,
  cursor,
  imageContainerRef,
  imageStyle,
  isDraggingLeft,
  isDraggingOver,
  leftImage,
  nbDraggedFiles,
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
  const isContestMode = contestState !== undefined && !contestState.isComplete;
  return (
    <motion.div
      animate={{ height: containerHeight }}
      className="relative mb-8 max-h-[calc(100vh-382px)] overflow-hidden rounded-xl"
      data-testid="image-viewer"
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
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* v8 ignore start -- @preserve */}
      <motion.div
        animate={{ opacity: isDraggingOver ? 1 : 0 }}
        className={cn("pointer-events-none absolute inset-1 z-50 flex items-center justify-center rounded-2xl border-5 border-dashed", { "bg-chart-3/40 border-chart-3": nbDraggedFiles >= 3, "bg-primary/40 border-primary": nbDraggedFiles < 3 })}
        initial={{ opacity: 0 }}
        style={{ display: isDraggingOver ? "flex" : "none" }}
        transition={{ duration: 0.2 }}
      >
        {nbDraggedFiles === 1 && (
          <motion.div animate={{ scale: isDraggingOver ? 1 : 0.9 }} className="flex w-full justify-around" initial={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
            <motion.div
              animate={{ scale: isDraggingLeft ? 1.2 : 1 }}
              className={cn("rounded-lg bg-background/80 px-6 py-3 text-lg font-semibold text-foreground", { "bg-secondary/90": isDraggingLeft })}
              initial={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              Change left image
            </motion.div>
            <motion.div
              animate={{ scale: isDraggingLeft ? 1 : 1.2 }}
              className={cn("rounded-lg bg-background/80 px-6 py-3 text-lg font-semibold text-foreground", { "bg-secondary/90": !isDraggingLeft })}
              initial={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              Change right image
            </motion.div>
          </motion.div>
        )}
        {nbDraggedFiles === 2 && (
          <motion.div animate={{ scale: isDraggingOver ? 1 : 0.9 }} className="rounded-lg bg-background/80 px-6 py-3 text-lg font-semibold text-foreground" initial={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
            Drop these 2 images to compare them
          </motion.div>
        )}
        {nbDraggedFiles >= 3 && (
          <motion.div animate={{ scale: isDraggingOver ? 1 : 0.9 }} className="rounded-lg bg-background/80 px-6 py-3 text-lg font-semibold text-foreground" initial={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
            Drop these {nbDraggedFiles} images to start a contest
          </motion.div>
        )}
      </motion.div>
      {/* v8 ignore stop -- @preserve */}

      <motion.div animate={{ opacity: 1 }} className="pointer-events-none absolute inset-0 select-none" initial={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <img alt="right" className="size-full object-contain" src={rightImage} style={imageStyle} />
      </motion.div>

      <motion.div
        animate={{ opacity: 1 }}
        className="pointer-events-none absolute inset-0 select-none"
        initial={{ opacity: 0 }}
        style={{
          clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)`,
        }}
        transition={{ damping: 30, opacity: { duration: 0.3 }, stiffness: 300, type: "spring" }}
      >
        <img alt="left" className="size-full object-contain" src={leftImage} style={imageStyle} />
      </motion.div>

      <motion.div
        animate={{ opacity: 1 }}
        className={cn("absolute top-0 bottom-0 w-1 cursor-ew-resize bg-primary mix-blend-difference shadow-lg transition-colors", { "pointer-events-none": isDraggingOver })}
        initial={{ opacity: 0 }}
        onMouseDown={onMouseDownOnHandle}
        style={{ left: `${sliderPosition[0]}%` }}
        test-id="slider-bar"
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-primary shadow-xl active:cursor-grabbing"
          test-id="slider-handle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex gap-1">
            <div className="h-6 w-1 rounded bg-primary-foreground"></div>
            <div className="h-6 w-1 rounded bg-primary-foreground"></div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className={cn("pointer-events-none absolute right-2 bottom-2 rounded bg-accent/50 px-2 py-1 text-xs text-accent-foreground")}
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Zoom: {Math.round(zoom * 100)}%
      </motion.div>
      {/* v8 ignore start -- @preserve */}
      <motion.div animate={{ opacity: isContestMode ? 1 : 0, y: isContestMode ? 0 : 20 }} className={cn("absolute bottom-2 left-2", { "pointer-events-none": isDraggingOver })} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
        <Button name="choose-left" onClick={() => onSelectWinner(contestState?.currentMatch?.leftImage.id ?? 0)} variant="secondary">
          Choose left image
        </Button>
      </motion.div>
      <motion.div animate={{ opacity: isContestMode ? 1 : 0, y: isContestMode ? 0 : 20 }} className={cn("absolute right-2 bottom-2", { "pointer-events-none": isDraggingOver })} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
        <Button name="choose-right" onClick={() => onSelectWinner(contestState?.currentMatch?.rightImage.id ?? 0)} variant="secondary">
          Choose right image
        </Button>
      </motion.div>
      {/* v8 ignore stop -- @preserve */}
    </motion.div>
  );
}
