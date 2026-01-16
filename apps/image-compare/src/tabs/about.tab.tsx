// oxlint-disable id-length
// oxlint-disable no-magic-numbers
import { Paragraph, Title } from "@monorepo/components";
import { cn } from "@monorepo/utils";
import { motion, type Variants } from "framer-motion";

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.15,
    },
  },
} satisfies Variants;

const textAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }, y: 0 },
} satisfies Variants;

const imageAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
} satisfies Variants;

function Num({ children: number }: { children: string }) {
  return <span className="mx-1 inline-flex size-5 justify-center rounded-full bg-blue-900 font-mono leading-5 shadow-md shadow-accent-foreground/30">{number}</span>;
}

export function About() {
  const titleClasses = cn("mx-auto mt-10 w-1/2 border-t border-primary/30 pt-8 text-center text-4xl text-primary");
  return (
    <div className="flex flex-col justify-center gap-4 bg-accent" data-testid="about-tab">
      <motion.div animate="show" className="mx-auto prose prose-xl mb-20" initial="hidden" variants={containerAnimation}>
        <motion.div variants={textAnimation}>
          <Title className={cn(titleClasses, "border-0")} level={2}>
            Purpose
          </Title>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Paragraph>Image Compare is a simple tool to compare two images side by side with a draggable slider. It allows you to zoom in and pan around the images for detailed comparison.</Paragraph>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Title className={titleClasses} level={2}>
            Usage
          </Title>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Paragraph>
            You are on menu <Num>1</Num> on the screenshot below :
          </Paragraph>
        </motion.div>
        <motion.img alt="demo" className="shadow-xl shadow-muted-foreground/20" src="/demo.jpg" variants={imageAnimation} />
        <motion.div variants={textAnimation}>
          <Paragraph>
            Go to menu <Num>2</Num> to see the comparison in action or menu <Num>3</Num> to adjust comparison settings.
          </Paragraph>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Paragraph>
            You can upload your own images <Num>4</Num> & <Num>5</Num> by clicking the "Left Image" <Num>9</Num> and "Right Image" <Num>11</Num> buttons.'
          </Paragraph>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Paragraph>
            Use the slider <Num>6</Num> or <Num>7</Num> to adjust the comparison position. You can zoom in and out using your mouse wheel and pan around by clicking and dragging the images <Num>4</Num> & <Num>5</Num>.
          </Paragraph>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Paragraph>
            The zoom level is displayed at the bottom right corner <Num>8</Num>. You can reset the zoom and pan by clicking the "Reset View" button <Num>10</Num>.
          </Paragraph>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Title className={titleClasses} level={2}>
            Tech stack
          </Title>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Paragraph>This tool is built with React and TypeScript, utilizing modern web technologies for a smooth and responsive user experience.</Paragraph>
        </motion.div>
        <motion.div variants={textAnimation}>
          <Paragraph className="py-4 text-center font-mono opacity-50">__unique-mark__</Paragraph>
        </motion.div>
      </motion.div>
    </div>
  );
}
