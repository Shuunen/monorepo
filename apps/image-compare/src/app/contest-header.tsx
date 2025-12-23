// oxlint-disable id-length
import { Paragraph, Title } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import { motion } from 'framer-motion'
import type { ContestState } from './comparison.utils'

type ContestHeaderProps = {
  contestState: ContestState | undefined
}

export function ContestHeader({ contestState }: ContestHeaderProps) {
  const isContestMode = contestState !== undefined && !contestState.isComplete
  const isContestComplete = contestState?.isComplete ?? false
  if (!isContestComplete && !isContestMode) return undefined
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
      <div className={cn('flex flex-col items-center gap-4 relative mb-6 p-6 bg-primary/10 rounded-xl text-center')}>
        <Title>{isContestComplete ? '🏆 We have a winner !' : `Round ${contestState?.round} - Match ${contestState?.currentMatch?.matchNumber}`}</Title>
        <Paragraph className="flex gap-2 items-center justify-center">
          {isContestComplete && (
            <>
              Image file name : <span className="font-sans bg-accent px-2 rounded">{contestState?.winner?.filename}</span>
            </>
          )}
          {isContestMode && <>Select your preferred image</>}
        </Paragraph>
      </div>
    </motion.div>
  )
}
