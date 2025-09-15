/** biome-ignore-all lint/suspicious/noArrayIndexKey: not my code */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: not my code */
// oxlint-disable no-magic-numbers, arrow-body-style, max-lines-per-function
import { motion, stagger, useAnimate, useInView } from 'motion/react'
import { useEffect } from 'react'
import { cn } from '../shadcn/utils'

// source : https://ui.aceternity.com/components/typewriter-effect

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map(word => {
    return {
      ...word,
      text: word.text.split(''),
    }
  })

  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)
  useEffect(() => {
    if (isInView)
      animate(
        'span',
        {
          display: 'inline-block',
          opacity: 1,
          width: 'fit-content',
        },
        {
          delay: stagger(0.1),
          duration: 0.3,
          ease: 'easeInOut',
        },
      )
  }, [isInView])

  const renderWords = () => {
    return (
      <motion.div className="inline" ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <div className="inline-block" key={`word-${idx}`}>
              {word.text.map((char, index) => (
                <motion.span className={cn(`dark:text-white text-black opacity-0 hidden`, word.className)} initial={{}} key={`char-${index}`}>
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </motion.div>
    )
  }
  return (
    <div className={cn('text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center', className)}>
      {renderWords()}
      <motion.span
        animate={{
          opacity: 1,
        }}
        className={cn('inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500', cursorClassName)}
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      ></motion.span>
    </div>
  )
}

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map(word => {
    return {
      ...word,
      text: word.text.split(''),
    }
  })
  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div className="inline-block" key={`word-${idx}`}>
              {word.text.map((char, index) => (
                <span className={cn(`dark:text-white text-black `, word.className)} key={`char-${index}`}>
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex space-x-1 my-6', className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{
          width: '0%',
        }}
        transition={{
          delay: 1,
          duration: 2,
          ease: 'linear',
        }}
        whileInView={{
          width: 'fit-content',
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text:3xl xl:text-5xl font-bold"
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          {renderWords()}{' '}
        </div>{' '}
      </motion.div>
      <motion.span
        animate={{
          opacity: 1,
        }}
        className={cn('block rounded-sm w-[4px]  h-4 sm:h-6 xl:h-12 bg-blue-500', cursorClassName)}
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.8,

          repeat: Infinity,
          repeatType: 'reverse',
        }}
      ></motion.span>
    </div>
  )
}
