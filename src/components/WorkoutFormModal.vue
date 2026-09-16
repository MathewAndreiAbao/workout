<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ isEditing ? 'Edit Workout' : 'Add Workout' }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="close">Cancel</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list>
      <ion-item>
        <ion-input
          label="Exercise name"
          label-placement="stacked"
          placeholder="e.g. Push-ups"
          v-model="form.exerciseName"
        />
      </ion-item>

      <ion-item>
        <ion-select label="Exercise type" label-placement="stacked" v-model="form.exerciseType">
          <ion-select-option v-for="type in EXERCISE_TYPES" :key="type" :value="type">
            {{ type }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-input
          label="Duration (minutes)"
          label-placement="stacked"
          type="number"
          min="0"
          v-model.number="form.duration"
        />
      </ion-item>

      <ion-item>
        <ion-input
          label="Repetitions"
          label-placement="stacked"
          type="number"
          min="0"
          v-model.number="form.repetitions"
        />
      </ion-item>

      <ion-item>
        <ion-input label="Date" label-placement="stacked" type="date" v-model="form.date" />
      </ion-item>

      <ion-item>
        <ion-textarea
          label="Notes"
          label-placement="stacked"
          placeholder="Optional notes"
          :auto-grow="true"
          v-model="form.notes"
        />
      </ion-item>
    </ion-list>

    <ion-text v-if="validationError" color="danger">
      <p class="ion-padding-start">{{ validationError }}</p>
    </ion-text>

    <ion-button expand="block" class="ion-margin-top" @click="save">
      {{ isEditing ? 'Save Changes' : 'Add Workout' }}
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { EXERCISE_TYPES, type Workout, type WorkoutInput } from '@/types/workout';

// When "workout" is provided we are editing it; otherwise we are creating a new one.
const props = defineProps<{ workout: Workout | null }>();
const emit = defineEmits<{
  (event: 'save', workout: WorkoutInput): void;
  (event: 'close'): void;
}>();

const isEditing = !!props.workout;
const validationError = ref('');

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Pre-fill the form from the workout being edited, or start blank.
const form = reactive<WorkoutInput>({
  exerciseName: props.workout?.exerciseName ?? '',
  exerciseType: props.workout?.exerciseType ?? 'Strength',
  duration: props.workout?.duration ?? 0,
  repetitions: props.workout?.repetitions ?? 0,
  date: props.workout?.date ?? today(),
  notes: props.workout?.notes ?? '',
});

function save() {
  if (!form.exerciseName.trim()) {
    validationError.value = 'Exercise name is required.';
    return;
  }
  if (!form.date) {
    validationError.value = 'Date is required.';
    return;
  }
  validationError.value = '';
  emit('save', {
    ...form,
    exerciseName: form.exerciseName.trim(),
    duration: Number(form.duration) || 0,
    repetitions: Number(form.repetitions) || 0,
  });
}

function close() {
  emit('close');
}
</script>
