export type Severity = "avoid" | "caution" | "monitor";
export type Units = "lbs" | "kgs";
export type EffortMode = "RPE" | "RIR";

export interface Exercise {
  id: string;
  name: string;
  target: string;
  tags: string[];
}

export interface CustomExercise extends Exercise {
  loadMode: "external";
  defaultWeight: number;
  defaultReps: number;
  createdAt: string;
}

export interface ExerciseInjury {
  id: string;
  name: string;
  severity: Severity;
  forbiddenTags: string[];
  cautionTags?: string[];
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
  notes?: string;
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
  notes?: string;
}

export interface Settings {
  units: Units;
  defaultRest: number;
  rpeMode: EffortMode;
  haptics: boolean;
  audioCue: boolean;
  voiceCue: boolean;
}

export interface TemplatePlan {
  id: string;
  name: string;
  notes: string;
  exercises: string[];
  isMinimumSession?: boolean;
}

export type WorkoutSets = Record<string, SetEntry[]>;

export interface ExerciseConflict {
  injuryId: string;
  injury: string;
  level: "avoid" | "caution";
  tags: string[];
  severity: Severity;
  alternative: string | null;
}
