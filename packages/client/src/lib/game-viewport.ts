const ASPECT_RATIO = 16 / 9;

/** Largest 16:9 rectangle that fits in the browser viewport. */
export function computeSixteenByNineViewport() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw / vh > ASPECT_RATIO) {
    return {
      width: Math.round(vh * ASPECT_RATIO),
      height: vh
    };
  }

  return {
    width: vw,
    height: Math.round(vw / ASPECT_RATIO)
  };
}
