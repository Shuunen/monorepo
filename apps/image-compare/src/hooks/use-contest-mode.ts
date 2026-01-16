// oxlint-disable max-nested-callbacks
import { useCallback, useEffect, useRef, useState } from "react";
import { type ContestState, selectWinner } from "../utils/comparison.utils";
import { fetchImageMetadata, type ImageMetadata } from "../utils/image.utils";

type UseContestModeReturn = {
  contestState: ContestState | undefined;
  handleSelectWinner: (winnerId: number) => void;
  setContestState: (state: ContestState | undefined) => void;
};

type UseContestModeCallbacks = {
  onLeftImageUpdate: (image: string) => void;
  onLeftMetadataUpdate: (metadata: ImageMetadata) => void;
  onRightImageUpdate: (image: string) => void;
  onRightMetadataUpdate: (metadata: ImageMetadata) => void;
};

export function useContestMode(callbacks: UseContestModeCallbacks): UseContestModeReturn {
  const [contestState, setContestState] = useState<ContestState | undefined>(undefined);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (contestState?.currentMatch) {
      callbacksRef.current.onLeftImageUpdate(contestState.currentMatch.leftImage.url);
      callbacksRef.current.onRightImageUpdate(contestState.currentMatch.rightImage.url);
      void fetchImageMetadata(contestState.currentMatch.leftImage.url).then(metadata => {
        callbacksRef.current.onLeftMetadataUpdate({ ...metadata, filename: contestState.currentMatch?.leftImage.filename ?? metadata.filename });
      });
      void fetchImageMetadata(contestState.currentMatch.rightImage.url).then(metadata => {
        callbacksRef.current.onRightMetadataUpdate({ ...metadata, filename: contestState.currentMatch?.rightImage.filename ?? metadata.filename });
      });
    }
  }, [contestState]);

  const handleSelectWinner = useCallback(
    (winnerId: number) => {
      if (!contestState) return;
      const newState = selectWinner(contestState, winnerId);
      setContestState(newState);
    },
    [contestState],
  );

  return {
    contestState,
    handleSelectWinner,
    setContestState,
  };
}
