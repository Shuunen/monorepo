/** biome-ignore-all lint/suspicious/noArrayIndexKey: not my code */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: not my code */
// oxlint-disable no-magic-numbers, arrow-body-style, max-lines-per-function
import { cn } from "@monorepo/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";

// source : https://ui.aceternity.com/components/typewriter-effect

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map(word => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          delay: stagger(0.1),
          duration: 0.3,
          ease: "easeInOut",
        },
      );
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div className="inline" ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <div className="inline-block" key={`word-${idx}`}>
              {word.text.map((char, index) => (
                <motion.span className={cn(`hidden text-black opacity-0 dark:text-white`, word.className)} initial={{}} key={`char-${index}`}>
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div className={cn("text-center text-base font-bold sm:text-xl md:text-3xl lg:text-5xl", className)}>
      {renderWords()}
      <motion.span
        animate={{
          opacity: 1,
        }}
        className={cn("inline-block h-4 w-[4px] rounded-sm bg-blue-500 md:h-6 lg:h-10", cursorClassName)}
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map(word => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });
  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div className="inline-block" key={`word-${idx}`}>
              {word.text.map((char, index) => (
                <span className={cn(`text-black dark:text-white`, word.className)} key={`char-${index}`}>
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("my-6 flex space-x-1", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{
          width: "0%",
        }}
        transition={{
          delay: 1,
          duration: 2,
          ease: "linear",
        }}
        whileInView={{
          width: "fit-content",
        }}
      >
        <div
          className="lg:text:3xl text-xs font-bold sm:text-base md:text-xl xl:text-5xl"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {renderWords()}{" "}
        </div>{" "}
      </motion.div>
      <motion.span
        animate={{
          opacity: 1,
        }}
        className={cn("block h-4 w-[4px] rounded-sm bg-blue-500 sm:h-6 xl:h-12", cursorClassName)}
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.8,

          repeat: Infinity,
          repeatType: "reverse",
        }}
      ></motion.span>
    </div>
  );
};
