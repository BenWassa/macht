import type { Exercise, TemplatePlan } from './types';

/*
 * Injury tag taxonomy:
 * shoulder: general shoulder sensitivity under loaded press/pull positions.
 * posterior_labrum: externally rotated or behind-neck positions that stress the posterior labrum.
 * anterior_labrum: deep shoulder extension and anterior capsule stress.
 * deep_rom: end-range positions that can be limited during flare-ups.
 * cervical_spine: overhead/behind-neck work with neck positioning demands.
 * knee: loaded knee flexion or direct quad isolation stress.
 * lower_back: hip hinge or axial loading that asks for spinal tolerance.
 * grip: heavy grip demand.
 * elbow: supinated or high-tension elbow flexion demand.
 */
export const EXERCISE_LIBRARY: Exercise[] = [
  { id: 'squat', name: 'Barbell Back Squat', target: 'Quads / Glutes', tags: ['knee', 'lower_back'] },
  { id: 'deadlift', name: 'Conventional Deadlift', target: 'Posterior chain', tags: ['lower_back', 'grip'] },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', target: 'Hamstrings / Glutes', tags: ['lower_back'] },
  { id: 'bench_press', name: 'Flat Barbell Bench Press', target: 'Chest / Triceps', tags: ['shoulder', 'deep_rom', 'posterior_labrum', 'anterior_labrum'] },
  { id: 'overhead_press', name: 'Overhead Barbell Press', target: 'Shoulders / Triceps', tags: ['shoulder', 'posterior_labrum', 'cervical_spine'] },
  { id: 'landmine_press', name: 'Half-Kneeling Landmine Press', target: 'Shoulders / Triceps', tags: [] },
  { id: 'neutral_db_press', name: 'Neutral Grip DB Press', target: 'Chest / Triceps', tags: [] },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press', target: 'Upper chest', tags: ['shoulder', 'deep_rom'] },
  { id: 'lat_pulldown_front', name: 'Front Lat Pulldown', target: 'Lats / Upper back', tags: [] },
  { id: 'lat_pulldown_behind', name: 'Behind Neck Lat Pulldown', target: 'Lats', tags: ['shoulder', 'posterior_labrum', 'deep_rom'] },
  { id: 'chest_supported_row', name: 'Chest-Supported Row', target: 'Upper back', tags: [] },
  { id: 'barbell_row', name: 'Barbell Bent-Over Row', target: 'Back / Grip', tags: ['lower_back'] },
  { id: 'dumbbell_row', name: 'One-Arm Dumbbell Row', target: 'Lats / Back', tags: [] },
  { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', target: 'Lateral delts', tags: [] },
  { id: 'face_pull', name: 'Cable Face Pull', target: 'Rear delts / Rotator', tags: [] },
  { id: 'chin_up', name: 'Chin-Up', target: 'Lats / Biceps', tags: ['elbow'] },
  { id: 'pull_up', name: 'Pull-Up', target: 'Lats / Back', tags: ['shoulder', 'posterior_labrum'] },
  { id: 'dip', name: 'Chest Dip', target: 'Chest / Triceps', tags: ['shoulder', 'anterior_labrum', 'deep_rom'] },
  { id: 'leg_press', name: 'Leg Press', target: 'Quads', tags: ['knee'] },
  { id: 'leg_extension', name: 'Leg Extension', target: 'Quads', tags: ['knee'] },
  { id: 'leg_curl', name: 'Lying Leg Curl', target: 'Hamstrings', tags: [] },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', target: 'Triceps', tags: [] },
];

export const DEFAULT_TEMPLATE: TemplatePlan = {
  id: 'ppl-push-adapted',
  name: 'PPL - Push (adapted)',
  notes: 'Bench press and overhead press substituted. Movement patterns adjusted to protect left posterior shoulder.',
  exercises: ['neutral_db_press', 'incline_db_press', 'cable_lateral_raise', 'tricep_pushdown'],
};

export const getExerciseById = (exerciseId: string): Exercise | undefined =>
  EXERCISE_LIBRARY.find((exercise) => exercise.id === exerciseId);
