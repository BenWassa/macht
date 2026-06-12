import type { Units } from "@/domain/types";

const DENOMS_LBS = [45, 35, 25, 10, 5, 2.5];
const DENOMS_KGS = [25, 20, 15, 10, 5, 2.5, 1.25];

/** Smallest weight change loadable with the smallest plate pair. */
export function loadStep(units: Units): number {
  return units === "lbs" ? 2.5 : 1.25;
}

export function roundToLoadable(weight: number, units: Units): number {
  const step = loadStep(units);
  return Math.max(0, Math.round(weight / step) * step);
}

export function floorToLoadable(weight: number, units: Units): number {
  const step = loadStep(units);
  return Math.max(0, Math.floor(weight / step + 1e-9) * step);
}

export function loadabilityDelta(weight: number, units: Units): number {
  const barWeight = units === "lbs" ? 45 : 20;
  if (weight <= barWeight) return 0;
  let perSide = (weight - barWeight) / 2;
  const denoms = units === "lbs" ? DENOMS_LBS : DENOMS_KGS;
  for (const denom of denoms) {
    while (perSide >= denom - 0.01) perSide -= denom;
  }
  const leftover = Math.round(perSide * 200) / 100;
  return leftover;
}
