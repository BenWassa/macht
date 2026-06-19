/**
 * The home hero gets warmer as total strength climbs: a long-horizon athlete
 * watches the screen heat up over months. Cool steel-blue at the start,
 * molten amber at the top end. OKLCH so the ramp stays perceptually even and
 * chroma never blows out at the extremes.
 */

// Total e1RM (sum of the Big Five) mapped onto a 0..1 heat scale.
// ~600 lbs reads as the cool floor, ~1600 lbs as full heat. Beyond that it
// holds at max rather than running away.
const FLOOR = 600;
const CEILING = 1600;

export interface StrengthAccent {
  /** 0..1 — how far up the strength ramp the lifter is. */
  heat: number;
  /** Primary number / glow color. */
  hot: string;
  /** Cooler companion for the trend + gradient tail. */
  cool: string;
  /** Soft radial glow behind the number. */
  glow: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function strengthAccent(total: number): StrengthAccent {
  const heat = Math.max(0, Math.min(1, (total - FLOOR) / (CEILING - FLOOR)));

  // Hue: 245 (steel blue) -> 45 (amber). Lightness/chroma stay rich but safe.
  const hueHot = lerp(245, 45, heat);
  const hueCool = lerp(250, 90, heat);
  const lHot = lerp(0.78, 0.82, heat);
  const cHot = lerp(0.13, 0.17, heat);

  return {
    heat,
    hot: `oklch(${lHot.toFixed(3)} ${cHot.toFixed(3)} ${hueHot.toFixed(1)})`,
    cool: `oklch(0.7 0.11 ${hueCool.toFixed(1)})`,
    glow: `oklch(${lHot.toFixed(3)} ${cHot.toFixed(3)} ${hueHot.toFixed(1)} / ${lerp(
      0.1,
      0.26,
      heat,
    ).toFixed(3)})`,
  };
}
