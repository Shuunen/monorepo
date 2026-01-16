export const colors = ["", "blue", "green", "red", "yellow"] as const;

export type Color = (typeof colors)[number];

export type Bottle = Color[];

/**
 * Create a color cycler
 * @returns the next color function
 */
function createColorCycler() {
  let currentIndex = 0;
  return function getNextColor(canBeTransparent = false) {
    const color = colors[currentIndex];
    currentIndex = (currentIndex + 1) % colors.length;
    if (!canBeTransparent && color === "") return getNextColor(canBeTransparent);
    /* v8 ignore next -- @preserve */
    return color ?? "blue";
  };
}

export const getNextColor = createColorCycler();
