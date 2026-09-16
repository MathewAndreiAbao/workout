<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workout Tracker</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="isLoading" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <ion-text v-else-if="errorMessage" color="danger">
        <p class="ion-padding">{{ errorMessage }}</p>
      </ion-text>

      <div v-else-if="workouts.length === 0" class="empty-state ion-padding ion-text-center">
        <ion-icon :icon="barbellIcon" size="large" color="medium" />
        <p>No workouts yet.</p>
        <p>Tap the + button to log your first workout.</p>
      </div>

      <ion-list v-else>
        <WorkoutCard
          v-for="workout in workouts"
          :key="workout.id"
          :workout="workout"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openAddModal">
          <ion-icon :icon="addIcon" />
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
        <WorkoutFormModal
          v-if="isModalOpen"
          :workout="workoutBeingEdited"
          @save="saveWorkout"
          @close="closeModal"
        />
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonModal,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  alertController,
} from '@ionic/vue';
import { add as addIcon, barbell as barbellIcon } from 'ionicons/icons';
import WorkoutCard from '@/components/WorkoutCard.vue';
import WorkoutFormModal from '@/components/WorkoutFormModal.vue';
import { useWorkouts } from '@/composables/useWorkouts';
import type { Workout, WorkoutInput } from '@/types/workout';

const { workouts, isLoading, errorMessage, addWorkout, updateWorkout, deleteWorkout } =
  useWorkouts();

// Only two pieces of state control the modal: whether it is open, and which
// workout (if any) it is editing.
const isModalOpen = ref(false);
const workoutBeingEdited = ref<Workout | null>(null);

function openAddModal() {
  workoutBeingEdited.value = null;
  isModalOpen.value = true;
}

function openEditModal(workout: Workout) {
  workoutBeingEdited.value = workout;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  workoutBeingEdited.value = null;
}

// CREATE or UPDATE, depending on whether we opened the modal for a new
// workout or an existing one.
async function saveWorkout(data: WorkoutInput) {
  if (workoutBeingEdited.value) {
    await updateWorkout(workoutBeingEdited.value.id, data);
  } else {
    await addWorkout(data);
  }
  closeModal();
}

// DELETE, guarded by a confirmation prompt so a swipe can't destroy data by accident.
async function confirmDelete(workout: Workout) {
  const alert = await alertController.create({
    header: 'Delete Workout',
    message: `Delete "${workout.exerciseName}"? This cannot be undone.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', role: 'destructive', handler: () => deleteWorkout(workout.id) },
    ],
  });
  await alert.present();
}
</script>

<style scoped>
.empty-state {
  color: var(--ion-color-medium);
  margin-top: 15%;
}
</style>
