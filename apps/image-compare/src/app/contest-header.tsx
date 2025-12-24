// oxlint-disable id-length
import { Paragraph, Title } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import { motion } from 'framer-motion'
import type { ContestState, ImageMetadata } from './comparison.utils'
import { ImageInfos } from './image-metadata'

type ContestHeaderProps = {
  contestState: ContestState | undefined
  leftImageMetadata: ImageMetadata | undefined
  rightImageMetadata: ImageMetadata | undefined
}

function getTitle(isContestComplete: boolean, isContestMode: boolean, contestState: ContestState | undefined) {
  if (isContestComplete) return '🏆 We have a winner !'
  if (isContestMode) return `Round ${contestState?.round} - Match ${contestState?.currentMatch?.matchNumber}`
  return ''
}

export function ContestHeader({ contestState, leftImageMetadata, rightImageMetadata }: ContestHeaderProps) {
  const isContestMode = contestState !== undefined && !contestState.isComplete
  const isContestComplete = contestState?.isComplete ?? false
  const showImageInfo = !isContestMode && !isContestComplete
  if (!showImageInfo && !isContestComplete && !isContestMode) return undefined
  const title = getTitle(isContestComplete, isContestMode, contestState)
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
      <div className={cn('flex flex-col items-center gap-4 relative mb-6 p-6 bg-primary/10 rounded-xl text-center')}>
        {title.length > 0 && <Title className={cn({ 'absolute top-12': !isContestMode })}>{title}</Title>}
        {isContestMode && <Paragraph>Select your preferred image</Paragraph>}
        {!isContestMode && <ImageInfos infos={[leftImageMetadata, rightImageMetadata]} />}
      </div>
    </motion.div>
  )
}
