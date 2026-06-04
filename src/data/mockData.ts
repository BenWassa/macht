import type { ExerciseInjury, SessionLog } from "@/domain/types";

export const INITIAL_INJURIES: ExerciseInjury[] = [
  {
    id: "labrum_left_anteroinferior",
    name: "Left anteroinferior labral tear",
    severity: "avoid",
    forbiddenTags: [
      "abduction_external_rotation",
      "overhead_load",
      "hanging_traction",
      "dip_pattern",
      "wide_pressing",
      "contact_posting",
      "sudden_traction",
      "heavy_anterior_shoulder_load",
    ],
    cautionTags: [
      "shoulder_abduction",
      "shoulder_external_rotation",
      "shoulder_extension",
      "heavy_rowing",
      "push_up_position",
      "loaded_carry",
      "barbell_rack_position",
    ],
    notes:
      "Treat as active avoid until cleared. Stop for slipping, shifting, clunking, apprehension, sharp pain, numbness, tingling, or radiating symptoms.",
    dateAdded: "2026-06-03",
  },
];

export const MOCK_HISTORY: SessionLog[] = [
  {
    id: "1",
    date: "2026-06-02",
    template: "Session A - Lower Strength + Shoulder Control",
    duration: "47m",
    volume: 15120,
    sets: 18,
    adapted: false,
    isMinimumSession: false,
  },
  {
    id: "2",
    date: "2026-05-30",
    template: "Session B - Conditioning + Core",
    duration: "39m",
    volume: 0,
    sets: 10,
    adapted: false,
    isMinimumSession: false,
  },
  {
    id: "3",
    date: "2026-05-27",
    template: "Session C - Lower Hypertrophy + Stability",
    duration: "51m",
    volume: 13960,
    sets: 16,
    adapted: false,
    isMinimumSession: false,
  },
  {
    id: "4",
    date: "2026-05-24",
    template: "Session D - Easy Base (min)",
    duration: "34m",
    volume: 0,
    sets: 6,
    adapted: false,
    isMinimumSession: true,
  },
  {
    id: "5",
    date: "2026-05-21",
    template: "Session A - Lower Strength + Shoulder Control",
    duration: "46m",
    volume: 14340,
    sets: 17,
    adapted: false,
    isMinimumSession: false,
  },
];
