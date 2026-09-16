import { onUnmounted, ref } from 'vue';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Workout, WorkoutInput } from '@/types/workout';
const workoutsRef = collection(db, 'workouts');

export function useWorkouts() {
  const workouts = ref<Workout[]>([]);
  const isLoading = ref(true);
  const errorMessage = ref('');


  const newestFirst = query(workoutsRef, orderBy('date', 'desc'));
  const stopListening = onSnapshot(
    newestFirst,
    (snapshot) => {
      workouts.value = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as WorkoutInput),
      }));
      isLoading.value = false;
    },
    (error) => {
      console.error('Failed to load workouts:', error);
      errorMessage.value = 'Could not load workouts. Check your connection and Firebase setup.';
      isLoading.value = false;
    },
  );
  onUnmounted(stopListening);

  // CREATE
  const addWorkout = (workout: WorkoutInput) => addDoc(workoutsRef, workout);

  // UPDATE
  const updateWorkout = (id: string, workout: WorkoutInput) =>
    updateDoc(doc(db, 'workouts', id), { ...workout });

  // DELETE
  const deleteWorkout = (id: string) => deleteDoc(doc(db, 'workouts', id));

  return { workouts, isLoading, errorMessage, addWorkout, updateWorkout, deleteWorkout };
}
