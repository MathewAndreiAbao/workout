<template>
  <ion-item-sliding>
    <ion-item button @click="$emit('edit', workout)">
      <ion-label>
        <h2>{{ workout.exerciseName }}</h2>
        <p>
          <ion-badge :color="typeColor">{{ workout.exerciseType }}</ion-badge>
          &nbsp;{{ workout.duration }} min &middot; {{ workout.repetitions }} reps &middot;
          {{ formattedDate }}
        </p>
        <p v-if="workout.notes">{{ workout.notes }}</p>
      </ion-label>
    </ion-item>

    <ion-item-options side="end">
      <ion-item-option color="primary" @click="$emit('edit', workout)">
        <ion-icon slot="icon-only" :icon="createIcon" />
      </ion-item-option>
      <ion-item-option color="danger" @click="$emit('delete', workout)">
        <ion-icon slot="icon-only" :icon="trashIcon" />
      </ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonBadge,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from '@ionic/vue';
import { create as createIcon, trash as trashIcon } from 'ionicons/icons';
import type { Workout } from '@/types/workout';

const props = defineProps<{ workout: Workout }>();
defineEmits<{
  (event: 'edit', workout: Workout): void;
  (event: 'delete', workout: Workout): void;
}>();

// Simple, understandable rule: one color per exercise type badge.
const typeColors: Record<string, string> = {
  Cardio: 'danger',
  Strength: 'primary',
  Flexibility: 'success',
  Sports: 'warning',
  Other: 'medium',
};
const typeColor = computed(() => typeColors[props.workout.exerciseType] ?? 'medium');

const formattedDate = computed(() =>
  new Date(`${props.workout.date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
);
</script>
