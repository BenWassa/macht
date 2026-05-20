import type { ExerciseInjury, SessionLog } from "@/domain/types";

export const INITIAL_INJURIES: ExerciseInjury[] = [
  {
    id: "labrum_left",
    name: "Left Posterior Labrum",
    severity: "avoid",
    forbiddenTags: ["posterior_labrum", "deep_rom"],
    notes:
      "Avoid extreme external rotation under load. Limit pressing ROM to neutral profiles. MRI pending.",
    dateAdded: "2026-05-12",
  },
];

export const MOCK_HISTORY: SessionLog[] = [
  {
    id: "1",
    date: "2026-05-18",
    template: "PPL - Pull",
    duration: "48m",
    volume: 12450,
    sets: 14,
    adapted: false,
    isMinimumSession: false,
  },
  {
    id: "2",
    date: "2026-05-16",
    template: "PPL - Push (adapted)",
    duration: "41m",
    volume: 9800,
    sets: 12,
    adapted: true,
    isMinimumSession: false,
  },
  {
    id: "3",
    date: "2026-05-13",
    template: "PPL - Legs",
    duration: "52m",
    volume: 15400,
    sets: 15,
    adapted: false,
    isMinimumSession: false,
  },
  {
    id: "4",
    date: "2026-05-10",
    template: "PPL - Pull",
    duration: "45m",
    volume: 11900,
    sets: 13,
    adapted: false,
    isMinimumSession: false,
  },
  {
    id: "5",
    date: "2026-05-08",
    template: "PPL - Push (adapted)",
    duration: "39m",
    volume: 9450,
    sets: 12,
    adapted: true,
    isMinimumSession: false,
  },
];
