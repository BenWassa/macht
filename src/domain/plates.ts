import type { Units } from './types';

export interface PlateSpec {
  h: number;
  w: number;
  bg: string;
  color: string;
  label: string;
}

export const PLATE_DATA_LBS: Record<number, PlateSpec> = {
  45: { h: 64, w: 18, bg: '#dc2626', color: '#f8fafc', label: '45' },
  35: { h: 56, w: 16, bg: '#2563eb', color: '#f8fafc', label: '35' },
  25: { h: 48, w: 14, bg: '#ca8a04', color: '#111111', label: '25' },
  10: { h: 40, w: 12, bg: '#16a34a', color: '#f8fafc', label: '10' },
  5: { h: 32, w: 10, bg: '#737373', color: '#f8fafc', label: '5' },
  2.5: { h: 24, w: 8, bg: '#3a3a3a', color: '#a3a3a3', label: '2.5' },
};

export const PLATE_DATA_KGS: Record<number, PlateSpec> = {
  25: { h: 64, w: 18, bg: '#dc2626', color: '#f8fafc', label: '25' },
  20: { h: 56, w: 16, bg: '#2563eb', color: '#f8fafc', label: '20' },
  15: { h: 48, w: 14, bg: '#ca8a04', color: '#111111', label: '15' },
  10: { h: 40, w: 12, bg: '#16a34a', color: '#f8fafc', label: '10' },
  5: { h: 32, w: 10, bg: '#737373', color: '#f8fafc', label: '5' },
  2.5: { h: 24, w: 8, bg: '#3a3a3a', color: '#a3a3a3', label: '2.5' },
  1.25: { h: 18, w: 6, bg: '#1a1a1a', color: '#6b6b6b', label: '1.25' },
};

export const getPlateData = (units: Units): Record<number, PlateSpec> =>
  units === 'lbs' ? PLATE_DATA_LBS : PLATE_DATA_KGS;

export function getPlates(weight: number, units: Units = 'lbs'): number[] {
  const barWeight = units === 'lbs' ? 45 : 20;
  let remaining = (weight - barWeight) / 2;
  if (remaining <= 0) return [];
  const denoms = units === 'lbs' ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25];
  const result: number[] = [];
  for (const denom of denoms) {
    while (remaining >= denom - 0.01) {
      result.push(denom);
      remaining -= denom;
    }
  }
  return result;
}
