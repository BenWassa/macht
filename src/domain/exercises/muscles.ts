import type { MuscleId } from "@/domain/shared/ids";

export type MusclePriority = "emphasize" | "grow" | "maintain";

export interface Muscle {
  id: MuscleId;
  name: string;
  region:
    | "chest"
    | "back"
    | "shoulders"
    | "arms"
    | "quads"
    | "hamstrings"
    | "glutes"
    | "calves"
    | "core"
    | "other";
}

export type MusclePriorities = Partial<Record<MuscleId, MusclePriority>>;

export interface MuscleContribution {
  muscleId: MuscleId;
  role: "primary" | "secondary";
  contribution?: number;
}
