// oxlint-disable id-length
import { Paragraph, Title } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import { motion } from 'framer-motion'
import { memo } from 'react'
import type { ContestState } from '../utils/comparison.utils'
import type { ImageMetadata } from '../utils/image.utils'
import { logger } from '../utils/logger.utils'
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

export const ContestHeader = memo(function ContestHeader({ contestState, leftImageMetadata, rightImageMetadata }: ContestHeaderProps) {
  const isContestMode = contestState !== undefined && !contestState.isComplete
  const isContestComplete = contestState?.isComplete ?? false
  const title = getTitle(isContestComplete, isContestMode, contestState)
  const leftWin = contestState?.isComplete ? contestState.winner?.filename === leftImageMetadata?.filename : undefined
  const imageInfos = [leftImageMetadata, rightImageMetadata]
  logger.info('Rendering ContestHeader')
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
      <div className={cn('flex flex-col items-center gap-4 relative mb-6 p-6 to-success via-transparent rounded-xl text-center bg-primary/10', { 'bg-conic-0': leftWin, 'bg-conic-180': leftWin === false })}>
        {title.length > 0 && <Title className={cn({ 'absolute top-12 shadow-xl bg-accent/80 px-5 py-3 rounded-md': !isContestMode })}>{title}</Title>}
        {isContestComplete && <img alt="Stars Twinkling" className={cn('absolute h-36 top-0 w-28', { '-left-24': leftWin, '-right-24 rotate-180': leftWin === false })} src="/stars-twinkling.gif" />}
        {isContestMode && <Paragraph>Select your preferred image</Paragraph>}
        {!isContestMode && <ImageInfos infos={imageInfos} leftWin={leftWin} />}
      </div>
    </motion.div>
  )
})
