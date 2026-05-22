import type { Units } from "@/domain/types";

const DENOMS_LBS = [45, 35, 25, 10, 5, 2.5];
const DENOMS_KGS = [25, 20, 15, 10, 5, 2.5, 1.25];

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
