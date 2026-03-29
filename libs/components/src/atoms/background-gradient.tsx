import { cn } from "@monorepo/utils";
import { motion } from "motion/react";
import type React from "react";

// source : https://ui.aceternity.com/components/background-gradient

export function BackgroundGradient({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) {
  const variants = {
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
    initial: {
      backgroundPosition: "0 50%",
    },
  };
  const animationProps = animate
    ? ({
        animate: "animate",
        initial: "initial",
        style: { backgroundSize: "400% 400%" },
        transition: {
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        },
        variants,
      } as const)
    : {};
  return (
    <div className={cn("group relative p-1", containerClassName)}>
      <motion.div
        {...animationProps}
        className={cn(
          "absolute inset-0 z-1 rounded-3xl opacity-60 blur-xl transition duration-500 will-change-transform group-hover:opacity-100",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]",
        )}
      />
      <motion.div
        {...animationProps}
        className={cn(
          "absolute inset-0 z-1 rounded-3xl will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]",
        )}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
