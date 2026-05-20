export type Severity = "avoid" | "caution" | "monitor";
export type Units = "lbs" | "kgs";
export type EffortMode = "RPE" | "RIR";

export interface Exercise {
  id: string;
  name: string;
  target: string;
  tags: string[];
}

export interface ExerciseInjury {
  id: string;
  name: string;
  severity: Severity;
  forbiddenTags: string[];
  notes: string;
  dateAdded: string;
  targetReturn?: string;
  clearedDate?: string;
}

export interface SetEntry {
  id: number;
  weight: number;
  reps: number;
  rpe: number | null;
  completed: boolean;
  last: string;
}

export interface ExerciseSnapshot {
  exerciseId: string;
  sets: SetEntry[];
  e1rm?: number;
}

export interface SessionLog {
  id: string;
  date: string;
  template: string;
  duration: string;
  volume: number;
  sets: number;
  adapted: boolean;
  isMinimumSession: boolean;
  exerciseSnapshots?: ExerciseSnapshot[];
}

export interface Settings {
  units: Units;
  defaultRest: number;
  rpeMode: EffortMode;
}

export interface TemplatePlan {
  id: string;
  name: string;
  notes: string;
  exercises: string[];
}

export type WorkoutSets = Record<string, SetEntry[]>;

export interface ExerciseConflict {
  injuryId: string;
  injury: string;
  tags: string[];
  severity: Severity;
  alternative: string | null;
}
