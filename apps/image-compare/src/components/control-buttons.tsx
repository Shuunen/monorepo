/** biome-ignore-all lint/correctness/useUniqueElementIds: fix me later */
// oxlint-disable id-length
import { Button } from "@monorepo/components";
import { cn } from "@monorepo/utils";
// oxlint-disable-next-line no-restricted-imports
import { RotateCcw, Upload } from "lucide-react";
import type { ContestState } from "../utils/comparison.utils";

type ControlButtonsProps = {
  contestState: ContestState | undefined;
  onLeftImageUpload: (e: { target: { files?: FileList | null } }) => void;
  onReset: () => void;
  onRightImageUpload: (e: { target: { files?: FileList | null } }) => void;
};

export function ControlButtons({ contestState, onLeftImageUpload, onReset, onRightImageUpload }: ControlButtonsProps) {
  const isContestMode = contestState !== undefined && !contestState.isComplete;
  const isContestComplete = contestState?.isComplete ?? false;
  return (
    <div className={cn("flex justify-center gap-4")} data-testid="control-buttons">
      {/* v8 ignore start -- @preserve */}
      <div className={cn({ hidden: isContestMode || isContestComplete })}>
        <label className="cursor-pointer" htmlFor="left-upload">
          <Button name="left-upload" onClick={() => document.querySelector<HTMLButtonElement>("#left-upload")?.click()}>
            <Upload />
            Change left image
          </Button>
        </label>
        <input accept="image/*" className="hidden" id="left-upload" onChange={onLeftImageUpload} type="file" />
      </div>
      {/* v8 ignore stop -- @preserve */}

      <Button name="reset" onClick={onReset} variant="outline">
        <RotateCcw />
        {isContestMode || isContestComplete ? "Exit contest" : "Reset view"}
      </Button>

      {/* v8 ignore start -- @preserve */}
      <div className={cn({ hidden: isContestMode || isContestComplete })}>
        <label className="cursor-pointer" htmlFor="right-upload">
          <Button name="right-upload" onClick={() => document.querySelector<HTMLButtonElement>("#right-upload")?.click()}>
            <Upload />
            Change right image
          </Button>
        </label>
        <input accept="image/*" className="hidden" id="right-upload" onChange={onRightImageUpload} type="file" />
      </div>
      {/* v8 ignore stop -- @preserve */}
    </div>
  );
}
