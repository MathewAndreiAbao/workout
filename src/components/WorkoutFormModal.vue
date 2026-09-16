<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ isEditing ? 'Edit Workout' : 'Add Workout' }}</ion-title>
      <ion-buttons slot="end">
        <ion-button :disabled="isSaving" @click="close">Cancel</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-list>
      <ion-item
        lines="full"
        :class="{ 'ion-invalid': !!fieldError('exerciseName'), 'ion-touched': submitted }"
      >
        <ion-input
          label="Exercise name *"
          label-placement="stacked"
          placeholder="e.g. Push-ups"
          v-model="form.exerciseName"
          maxlength="60"
          :disabled="isSaving"
        />
      </ion-item>
      <p v-if="fieldError('exerciseName')" class="field-error">
        <ion-icon :icon="alertIcon" /> {{ fieldError('exerciseName') }}
      </p>

      <ion-item
        lines="full"
        :class="{ 'ion-invalid': !!fieldError('exerciseType'), 'ion-touched': submitted }"
      >
        <ion-select
          label="Exercise type *"
          label-placement="stacked"
          v-model="form.exerciseType"
          :disabled="isSaving"
        >
          <ion-select-option v-for="type in EXERCISE_TYPES" :key="type" :value="type">
            {{ type }}
          </ion-select-option>
        </ion-select>
      </ion-item>
      <p v-if="fieldError('exerciseType')" class="field-error">
        <ion-icon :icon="alertIcon" /> {{ fieldError('exerciseType') }}
      </p>

      <div class="row">
        <div class="col">
          <ion-item
            lines="full"
            :class="{ 'ion-invalid': !!fieldError('duration'), 'ion-touched': submitted }"
          >
            <ion-input
              label="Duration (min) *"
              label-placement="stacked"
              type="number"
              inputmode="numeric"
              min="0"
              max="1000"
              v-model.number="form.duration"
              :disabled="isSaving"
            />
          </ion-item>
          <p v-if="fieldError('duration')" class="field-error">
            <ion-icon :icon="alertIcon" /> {{ fieldError('duration') }}
          </p>
        </div>

        <div class="col">
          <ion-item
            lines="full"
            :class="{ 'ion-invalid': !!fieldError('repetitions'), 'ion-touched': submitted }"
          >
            <ion-input
              label="Repetitions *"
              label-placement="stacked"
              type="number"
              inputmode="numeric"
              min="0"
              max="10000"
              v-model.number="form.repetitions"
              :disabled="isSaving"
            />
          </ion-item>
          <p v-if="fieldError('repetitions')" class="field-error">
            <ion-icon :icon="alertIcon" /> {{ fieldError('repetitions') }}
          </p>
        </div>
      </div>

      <ion-item
        lines="full"
        :class="{ 'ion-invalid': !!fieldError('date'), 'ion-touched': submitted }"
      >
        <ion-input
          label="Date *"
          label-placement="stacked"
          type="date"
          v-model="form.date"
          :disabled="isSaving"
        />
      </ion-item>
      <p v-if="fieldError('date')" class="field-error">
        <ion-icon :icon="alertIcon" /> {{ fieldError('date') }}
      </p>

      <ion-item lines="none">
        <ion-textarea
          label="Notes"
          label-placement="stacked"
          placeholder="Optional notes"
          :auto-grow="true"
          maxlength="300"
          v-model="form.notes"
          :disabled="isSaving"
        />
      </ion-item>
      <p v-if="fieldError('notes')" class="field-error">
        <ion-icon :icon="alertIcon" /> {{ fieldError('notes') }}
      </p>
    </ion-list>

    <ion-text v-if="serverError" color="danger">
      <p class="ion-padding-start server-error">{{ serverError }}</p>
    </ion-text>

    <ion-button expand="block" class="ion-margin-top" :disabled="isSaving" @click="save">
      <ion-spinner v-if="isSaving" name="crescent" class="btn-spinner" />
      <span v-else>{{ isEditing ? 'Save Changes' : 'Add Workout' }}</span>
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { alertCircle as alertIcon } from 'ionicons/icons';
import { EXERCISE_TYPES, type Workout, type WorkoutInput } from '@/types/workout';

// When "workout" is provided we are editing it; otherwise we are creating a new one.
// "onSave" performs the actual create/update so this component can await it,
// show a spinner, and surface a clear error if the operation fails.
const props = defineProps<{
  workout: Workout | null;
  onSave: (workout: WorkoutInput) => Promise<void>;
}>();
const emit = defineEmits<{
  (event: 'close'): void;
}>();

const isEditing = !!props.workout;
const submitted = ref(false);
const isSaving = ref(false);
const serverError = ref('');

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

type FieldErrors = Partial<Record<keyof WorkoutInput, string>>;

// All input validation lives here, in one place, so "is this form valid"
// and "why not" always agree.
const errors = computed<FieldErrors>(() => {
  const e: FieldErrors = {};

  const name = form.exerciseName?.trim() ?? '';
  if (!name) e.exerciseName = 'Exercise name is required.';
  else if (name.length > 60) e.exerciseName = 'Keep it under 60 characters.';

  if (!form.exerciseType) e.exerciseType = 'Select an exercise type.';

  if (form.duration === null || form.duration === undefined || Number.isNaN(Number(form.duration))) {
    e.duration = 'Enter a duration.';
  } else if (Number(form.duration) < 0) {
    e.duration = 'Cannot be negative.';
  } else if (Number(form.duration) > 1000) {
    e.duration = 'That looks too high.';
  }

  if (
    form.repetitions === null ||
    form.repetitions === undefined ||
    Number.isNaN(Number(form.repetitions))
  ) {
    e.repetitions = 'Enter a value.';
  } else if (Number(form.repetitions) < 0) {
    e.repetitions = 'Cannot be negative.';
  } else if (Number(form.repetitions) > 10000) {
    e.repetitions = 'That looks too high.';
  }

  if (!form.date) e.date = 'Date is required.';

  if (form.notes && form.notes.length > 300) e.notes = 'Keep notes under 300 characters.';

  return e;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

function fieldError(field: keyof WorkoutInput) {
  return submitted.value ? errors.value[field] : undefined;
}

async function save() {
  submitted.value = true;
  serverError.value = '';

  if (!isValid.value) return;

  isSaving.value = true;
  try {
    await props.onSave({
      ...form,
      exerciseName: form.exerciseName.trim(),
      duration: Number(form.duration),
      repetitions: Number(form.repetitions),
      notes: form.notes.trim(),
    });
    emit('close');
  } catch (error) {
    console.error('Failed to save workout:', error);
    serverError.value = 'Could not save this workout. Check your connection and try again.';
  } finally {
    isSaving.value = false;
  }
}

function close() {
  emit('close');
}
</script>

<style scoped>
.row {
  display: flex;
  gap: 12px;
}

.col {
  flex: 1;
  min-width: 0;
}

.server-error {
  font-size: 13px;
}

.btn-spinner {
  width: 18px;
  height: 18px;
}
</style>
