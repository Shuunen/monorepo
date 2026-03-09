/** biome-ignore-all lint/suspicious/noArrayIndexKey: not my code */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: not my code */
// oxlint-disable arrow-body-style, max-lines-per-function
import { cn } from "@monorepo/utils";
import { motion } from "motion/react";

// source : https://ui.aceternity.com/components/typewriter-effect

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
        className={cn("block h-4 w-1 rounded-sm bg-blue-500 sm:h-6 xl:h-12", cursorClassName)}
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.8,

          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};
