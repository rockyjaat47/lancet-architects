// Easings mirrored from the reference (GSAP expo.out / power3.inOut / power2.in)
export const expoOut = [0.16, 1, 0.3, 1] as const;
export const power3InOut = [0.65, 0, 0.35, 1] as const;
export const power2In = [0.55, 0, 1, 0.45] as const;

/** Gravity-like bounce, approximating the reference's CustomEase used for menu shapes. */
export function bounceOut(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}
