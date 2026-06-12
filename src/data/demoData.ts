import type { SessionLog } from "@/domain/types";
import { MOCK_HISTORY } from "@/data/mockData";

const set = (id: number, weight: number, reps: number, rpe: number) => ({
  id,
  weight,
  reps,
  rpe,
  completed: true,
  last: "-",
});

export const DEMO_HISTORY: SessionLog[] = [
  {
    id: "demo-1",
    date: "2026-06-10",
    template: "Session A - Lower Strength + Shoulder Control",
    duration: "49m",
    volume: 21480,
    sets: 18,
    adapted: false,
    isMinimumSession: false,
    exerciseSnapshots: [
      {
        exerciseId: "leg_press",
        sets: [set(1, 180, 12, 8), set(2, 180, 12, 8), set(3, 180, 12, 8)],
      },
      {
        exerciseId: "hamstring_curl",
        sets: [set(1, 65, 11, 8), set(2, 65, 10, 8), set(3, 65, 10, 8.5)],
      },
      {
        exerciseId: "calf_raise",
        sets: [set(1, 90, 20, 8), set(2, 90, 19, 8), set(3, 90, 18, 8.5)],
      },
    ],
  },
  {
    id: "demo-2",
    date: "2026-06-06",
    template: "Session C - Lower Hypertrophy + Stability",
    duration: "51m",
    volume: 19320,
    sets: 17,
    adapted: false,
    isMinimumSession: false,
    exerciseSnapshots: [
      {
        exerciseId: "hack_squat",
        sets: [set(1, 160, 12, 8), set(2, 160, 12, 8), set(3, 160, 12, 8)],
      },
      {
        exerciseId: "hip_thrust",
        sets: [set(1, 190, 12, 8), set(2, 190, 12, 8), set(3, 190, 11, 8.5)],
      },
      {
        exerciseId: "leg_extension",
        sets: [set(1, 70, 14, 8), set(2, 70, 13, 8)],
      },
    ],
  },
  {
    id: "demo-3",
    date: "2026-06-03",
    template: "Session A - Lower Strength + Shoulder Control",
    duration: "46m",
    volume: 20280,
    sets: 18,
    adapted: false,
    isMinimumSession: false,
    exerciseSnapshots: [
      {
        exerciseId: "leg_press",
        sets: [set(1, 170, 12, 8), set(2, 170, 12, 8), set(3, 170, 11, 8.5)],
      },
      {
        exerciseId: "hamstring_curl",
        sets: [set(1, 65, 10, 8), set(2, 65, 10, 8), set(3, 65, 9, 8.5)],
      },
      {
        exerciseId: "calf_raise",
        sets: [set(1, 85, 20, 8), set(2, 85, 19, 8), set(3, 85, 18, 8)],
      },
    ],
  },
  ...MOCK_HISTORY,
];
