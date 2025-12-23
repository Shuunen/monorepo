import { Paragraph, Title } from '@monorepo/components'
import { cn } from '@monorepo/utils'

function Num({ children: number }: { children: string }) {
  return <span className="font-mono bg-blue-900 shadow-md shadow-accent-foreground/30 size-5 inline-flex justify-center leading-5 mx-1 rounded-full">{number}</span>
}

export function About() {
  const titleClasses = cn('text-primary w-1/2 mx-auto text-center border-t pt-8 mt-10 border-primary/30')
  return (
    <div className="bg-accent flex flex-col gap-4 justify-center">
      <div className="prose mx-auto mb-20">
        <Title className={cn(titleClasses, 'border-0')} level={2}>
          Purpose
        </Title>
        <Paragraph>Image Compare is a simple tool to compare two images side by side with a draggable slider. It allows you to zoom in and pan around the images for detailed comparison.</Paragraph>
        <Title className={titleClasses} level={2}>
          Usage
        </Title>
        <Paragraph>
          You are on menu <Num>1</Num> on the screenshot below :
        </Paragraph>
        <img alt="demo" className="shadow-xl shadow-muted-foreground/20" src="/demo.jpg" />
        <Paragraph>
          Go to menu <Num>2</Num> to see the comparison in action or menu <Num>3</Num> to adjust comparison settings.
        </Paragraph>
        <Paragraph>
          You can upload your own images <Num>4</Num> & <Num>5</Num> by clicking the "Left Image" <Num>9</Num> and "Right Image" <Num>11</Num> buttons.'
        </Paragraph>
        <Paragraph>
          Use the slider <Num>6</Num> or <Num>7</Num> to adjust the comparison position. You can zoom in and out using your mouse wheel and pan around by clicking and dragging the images <Num>4</Num> & <Num>5</Num>.
        </Paragraph>
        <Paragraph>
          The zoom level is displayed at the bottom right corner <Num>8</Num>. You can reset the zoom and pan by clicking the "Reset View" button <Num>10</Num>.
        </Paragraph>
        <Title className={titleClasses} level={2}>
          Tech stack
        </Title>
        <Paragraph>This tool is built with React and TypeScript, utilizing modern web technologies for a smooth and responsive user experience.</Paragraph>
        {/** biome-ignore lint/correctness/useUniqueElementIds: it's ok */}
        <div className="text-center text-sm font-mono pb-4" id="unique-mark"></div>
      </div>
    </div>
  )
}
