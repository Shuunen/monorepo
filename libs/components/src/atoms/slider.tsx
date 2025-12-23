import { cn } from "@monorepo/utils";
import type { ComponentProps } from "react";
import { Slider as ShadSlider } from "../shadcn/slider";

type SliderProps = ComponentProps<typeof ShadSlider>;

export function Slider(props: SliderProps) {
  const classes = cn(props.className, "cursor-grab");
  return <ShadSlider {...props} className={classes} />;
}
