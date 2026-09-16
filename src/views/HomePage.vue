<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workout Tracker</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Workout Tracker</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="!isLoading && !errorMessage && workouts.length > 0" class="summary">
        <div class="summary-item">
          <span class="summary-value">{{ workouts.length }}</span>
          <span class="summary-label">Workouts</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-value">{{ totalMinutes }}</span>
          <span class="summary-label">Minutes</span>
        </div>
      </div>

      <div v-if="isLoading" class="state-block ion-text-center">
        <ion-spinner name="crescent" />
      </div>

      <div v-else-if="errorMessage" class="state-block ion-text-center">
        <ion-icon :icon="alertIcon" size="large" />
        <p class="state-title">Something went wrong</p>
        <p class="state-body">{{ errorMessage }}</p>
      </div>

      <div v-else-if="workouts.length === 0" class="state-block ion-text-center">
        <ion-icon :icon="barbellIcon" size="large" />
        <p class="state-title">No workouts yet</p>
        <p class="state-body">Tap the + button to log your first workout.</p>
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
          :on-save="saveWorkout"
          @close="closeModal"
        />
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
  IonTitle,
  IonToolbar,
  alertController,
  toastController,
} from '@ionic/vue';
import { add as addIcon, alertCircle as alertIcon, barbell as barbellIcon } from 'ionicons/icons';
import WorkoutCard from '@/components/WorkoutCard.vue';
import WorkoutFormModal from '@/components/WorkoutFormModal.vue';
import { useWorkouts } from '@/composables/useWorkouts';
import type { Workout, WorkoutInput } from '@/types/workout';

const { workouts, isLoading, errorMessage, addWorkout, updateWorkout, deleteWorkout } =
  useWorkouts();

const totalMinutes = computed(() => workouts.value.reduce((sum, w) => sum + (w.duration || 0), 0));

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

async function showToast(message: string, color: 'success' | 'danger' = 'success') {
  const toast = await toastController.create({
    message,
    duration: 2200,
    position: 'bottom',
    color,
  });
  await toast.present();
}

// CREATE or UPDATE, depending on whether we opened the modal for a new
// workout or an existing one. Left to throw on failure so the form modal
// can catch it, keep itself open, and show the user what went wrong.
async function saveWorkout(data: WorkoutInput) {
  const wasEditing = !!workoutBeingEdited.value;
  if (workoutBeingEdited.value) {
    await updateWorkout(workoutBeingEdited.value.id, data);
  } else {
    await addWorkout(data);
  }
  await showToast(wasEditing ? 'Workout updated.' : 'Workout added.');
}

// DELETE, guarded by a confirmation prompt so a swipe can't destroy data by accident.
async function confirmDelete(workout: Workout) {
  const alert = await alertController.create({
    header: 'Delete Workout',
    message: `Delete "${workout.exerciseName}"? This cannot be undone.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          try {
            await deleteWorkout(workout.id);
            await showToast('Workout deleted.');
          } catch (error) {
            console.error('Failed to delete workout:', error);
            await showToast('Could not delete this workout. Try again.', 'danger');
          }
        },
      },
    ],
  });
  await alert.present();
}
</script>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 20px 16px;
  border-bottom: var(--app-border-subtle);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.summary-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
}

.summary-divider {
  width: 1px;
  height: 32px;
  background: var(--ion-color-step-150);
}

.state-block {
  color: var(--ion-color-medium);
  margin-top: 18%;
  padding: 0 32px;
}

.state-block ion-icon {
  font-size: 40px;
  color: var(--ion-color-step-350);
}

.state-title {
  color: var(--ion-color-primary);
  font-weight: 600;
  font-size: 16px;
  margin: 12px 0 4px;
}

.state-body {
  font-size: 14px;
  margin: 0;
}
</style>
