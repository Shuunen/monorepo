// oxlint-disable no-magic-numbers, id-length
import type { ImageData } from "./image.utils";

export type PanPosition = { x: number; y: number };

export type DragStartPosition = { panX: number; panY: number; x: number; y: number };

export type ImageStyle = {
  transform: string;
  transition: string;
};

export type CursorType = "auto" | "grab" | "grabbing";

export const minHeight = 400;
export const minWidth = 700;
export const minZoom = 0.1;
export const maxZoom = 5;
export const zoomSensitivity = 0.001;
export const defaultSliderPosition = 50;
export const maxPercentage = 100;
export const padding = 48;
export const headerAndControlsHeight = 382;

export function calculateNewZoom(currentZoom: number, deltaY: number): number {
  const newZoom = currentZoom - deltaY * zoomSensitivity;
  return Math.min(Math.max(newZoom, minZoom), maxZoom);
}

export function calculateNewPan(dragStart: DragStartPosition, clientX: number, clientY: number): PanPosition {
  const dx = clientX - dragStart.x;
  const dy = clientY - dragStart.y;
  return { x: dragStart.panX + dx, y: dragStart.panY + dy };
}

export function calculateSliderPosition(clientX: number, rect: DOMRect): number {
  const x = clientX - rect.left;
  const newPosition = (x / rect.width) * maxPercentage;
  return Math.max(0, Math.min(maxPercentage, newPosition));
}

export function getImageStyle(pan: PanPosition, zoom: number, isPanning: boolean): ImageStyle {
  return {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transition: isPanning ? "none" : "transform 0.1s ease-out",
  };
}

export function getCursorType(isHandleDragging: boolean, zoom: number, isPanning: boolean): CursorType {
  if (isHandleDragging) return "grabbing";
  if (zoom > minZoom) return isPanning ? "grabbing" : "grab";
  return "auto";
}

export function shouldResetPan(zoom: number): boolean {
  return zoom === minZoom;
}

export type ContestImage = {
  url: string;
  id: number;
  eliminated: boolean;
  filename: string;
};

export type ContestMatch = {
  leftImage: ContestImage;
  rightImage: ContestImage;
  matchNumber: number;
};

export type ContestState = {
  allImages: ContestImage[];
  activeImages: ContestImage[];
  currentMatch: ContestMatch | undefined;
  round: number;
  isComplete: boolean;
  winner: ContestImage | undefined;
  matchesInRound: number;
  matchesCompletedInRound: number;
};

export function createContestState(imageData: ImageData[]): ContestState {
  const images = imageData.map((data, index) => ({
    eliminated: false,
    filename: data.filename,
    id: index,
    url: data.url,
  }));
  return {
    activeImages: images,
    allImages: images,
    currentMatch: undefined,
    isComplete: false,
    matchesCompletedInRound: 0,
    matchesInRound: Math.floor(images.length / 2),
    round: 1,
    winner: undefined,
  };
}

export function getNextMatch(state: ContestState): ContestMatch | undefined {
  const { activeImages, matchesCompletedInRound } = state;
  const pairIndex = matchesCompletedInRound * 2;
  const leftImage = activeImages[pairIndex];
  const rightImage = activeImages[pairIndex + 1];
  if (leftImage && rightImage)
    return {
      leftImage,
      matchNumber: matchesCompletedInRound + 1,
      rightImage,
    };
  return undefined;
}

export function selectWinner(state: ContestState, winnerId: number): ContestState {
  const loserInCurrentMatch =
    state.currentMatch?.leftImage.id === winnerId ? state.currentMatch.rightImage : state.currentMatch?.leftImage;
  const updatedAllImages = state.allImages.map(img =>
    img.id === loserInCurrentMatch?.id ? { ...img, eliminated: true } : img,
  );
  const updatedMatchesCompletedInRound = state.matchesCompletedInRound + 1;
  const nextMatch = getNextMatch({ ...state, matchesCompletedInRound: updatedMatchesCompletedInRound });
  if (nextMatch)
    return {
      ...state,
      allImages: updatedAllImages,
      currentMatch: nextMatch,
      matchesCompletedInRound: updatedMatchesCompletedInRound,
    };
  const remainingImages = updatedAllImages.filter(img => !img.eliminated);
  if (remainingImages.length === 1 && remainingImages[0])
    return {
      ...state,
      activeImages: remainingImages,
      allImages: updatedAllImages,
      currentMatch: undefined,
      isComplete: true,
      matchesCompletedInRound: updatedMatchesCompletedInRound,
      winner: remainingImages[0],
    };
  const newMatchesInRound = Math.floor(remainingImages.length / 2);
  const newMatch = getNextMatch({ ...state, activeImages: remainingImages, matchesCompletedInRound: 0 });
  return {
    ...state,
    activeImages: remainingImages,
    allImages: updatedAllImages,
    currentMatch: newMatch,
    matchesCompletedInRound: 0,
    matchesInRound: newMatchesInRound,
    round: state.round + 1,
  };
}

export function startContest(state: ContestState): ContestState {
  const firstMatch = getNextMatch(state);
  return {
    ...state,
    currentMatch: firstMatch,
  };
}

export function getNbFiles(e: DragEvent) {
  let amount = 0;
  const items = Array.from(e.dataTransfer?.items || []);
  for (const item of items) if (item.kind === "file") amount += 1;
  return amount;
}
