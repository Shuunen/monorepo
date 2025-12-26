// oxlint-disable id-length
import { Paragraph, Title } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import { motion } from 'framer-motion'
import type { ContestState, ImageMetadata } from '../utils/comparison.utils'
import { ImageInfos } from './image-infos'

type ContestHeaderProps = {
  contestState?: ContestState
  leftImageMetadata?: ImageMetadata
  rightImageMetadata?: ImageMetadata
}

function getTitle(isContestComplete: boolean, isContestMode: boolean, contestState: ContestState | undefined) {
  if (isContestComplete) return '🏆 We have a winner !'
  if (isContestMode) return `Round ${contestState?.round} - Match ${contestState?.currentMatch?.matchNumber}`
  return ''
}

export function ContestHeader({ contestState, leftImageMetadata, rightImageMetadata }: ContestHeaderProps) {
  const isContestMode = contestState !== undefined && !contestState.isComplete
  const isContestComplete = contestState?.isComplete ?? false
  const title = getTitle(isContestComplete, isContestMode, contestState)

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
      <div className={cn('flex flex-col items-center gap-4 relative mb-6 p-6 to-success via-transparent rounded-xl text-center bg-primary/10', { 'bg-conic-0': isContestComplete && leftImageMetadata?.isWinner, 'bg-conic-180': isContestComplete && rightImageMetadata?.isWinner })}>
        {title.length > 0 && <Title className={cn({ 'absolute top-12 shadow-xl bg-accent/80 px-5 py-3 rounded-md': !isContestMode })}>{title}</Title>}
        {isContestComplete && <img alt="Stars Twinkling" className={cn('absolute h-36 top-0 w-28', { '-left-24': leftImageMetadata?.isWinner, '-right-24 rotate-180': rightImageMetadata?.isWinner })} src="/stars-twinkling.gif" />}
        {isContestMode && <Paragraph>Select your preferred image</Paragraph>}
        {!isContestMode && <ImageInfos infos={[leftImageMetadata, rightImageMetadata]} />}
      </div>
    </motion.div>
  )
}
