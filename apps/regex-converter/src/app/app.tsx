import { IconOwl, TypewriterEffectSmooth } from "@monorepo/components";
import { Converter } from "./converter";

export function App() {
  const words = [
    {
      text: "Regex",
    },
    {
      className: "text-secondary",
      text: "Converter",
    },
  ];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-info/15 p-24">
      <div className="prose prose-lg w-full max-w-screen">
        <h1 className="mt-0 flex justify-center text-center">
          <TypewriterEffectSmooth className="mt-0 mb-0" words={words} />
        </h1>
        <Converter />
        <span className="mt-12 block w-full text-center text-sm text-muted-foreground italic">__unique-mark__</span>
        <IconOwl className="mx-auto mt-12 w-12 text-primary opacity-10" />
      </div>
    </div>
  );
}
