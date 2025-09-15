/** biome-ignore-all lint/suspicious/noArrayIndexKey: fix me later */
// oxlint-disable id-length, no-magic-numbers, max-lines-per-function
import { motion } from 'motion/react'
import React from 'react'
import { cn } from '../shadcn/utils'

// source : https://ui.aceternity.com/components/background-boxes

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = Array.from({ length: 150 }).fill(1)
  const cols = Array.from({ length: 100 }).fill(1)
  const colors = ['#93c5fd', '#f9a8d4', '#86efac', '#fde047', '#fca5a5', '#d8b4fe', '#93c5fd', '#a5b4fc', '#c4b5fd']
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

  return (
    <div
      className={cn('absolute -top-1/4 left-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4', className)}
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div className="relative h-8 w-16 border-l border-slate-700" key={`row${i}`}>
          {cols.map((_, j) => (
            <motion.div
              animate={{
                transition: { duration: 2 },
              }}
              className="relative h-8 w-16 border-t border-r border-slate-700"
              key={`col${j}`}
              whileHover={{
                backgroundColor: `${getRandomColor()}`,
                transition: { duration: 0 },
              }}
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg className="pointer-events-none absolute -top-[14px] -left-[22px] h-6 w-10 stroke-[1px] text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <title>Plus icon</title>
                  <path d="M12 6v12m6-6H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : undefined}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

export const Boxes = React.memo(BoxesCore)
