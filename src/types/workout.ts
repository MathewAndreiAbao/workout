
export const EXERCISE_TYPES = ['Cardio', 'Strength', 'Flexibility', 'Sports', 'Other'] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export interface WorkoutInput {
  exerciseName: string;
  exerciseType: ExerciseType;
  duration: number;
  repetitions: number;
  date: string;
  notes: string;
}

export interface Workout extends WorkoutInput {
  id: string;
}
