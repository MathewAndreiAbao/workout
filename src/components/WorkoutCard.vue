<template>
  <ion-item-sliding class="workout-card">
    <ion-item button detail="false" lines="none" @click="$emit('edit', workout)">
      <div class="type-icon" slot="start">
        <ion-icon :icon="typeIcon" />
      </div>

      <ion-label>
        <h2>{{ workout.exerciseName }}</h2>
        <p class="meta-row">
          <ion-badge>{{ workout.exerciseType }}</ion-badge>
          <span class="dot">&middot;</span>
          <span>{{ workout.duration }} min</span>
          <span class="dot">&middot;</span>
          <span>{{ workout.repetitions }} reps</span>
          <span class="dot">&middot;</span>
          <span>{{ formattedDate }}</span>
        </p>
        <p v-if="workout.notes" class="notes">{{ workout.notes }}</p>
      </ion-label>
      <ion-icon slot="end" :icon="chevronIcon" class="chevron" />
    </ion-item>

    <ion-item-options side="end">
      <ion-item-option @click="$emit('edit', workout)">
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
import {
  barbell,
  basketball,
  bodyOutline,
  chevronForward,
  create as createIcon,
  ellipsisHorizontal,
  heart,
  trash as trashIcon,
} from 'ionicons/icons';
import type { Workout } from '@/types/workout';

const props = defineProps<{ workout: Workout }>();
defineEmits<{
  (event: 'edit', workout: Workout): void;
  (event: 'delete', workout: Workout): void;
}>();

const chevronIcon = chevronForward;

// Monochrome design: exercise types are told apart by icon, not color.
const typeIcons: Record<string, string> = {
  Cardio: heart,
  Strength: barbell,
  Flexibility: bodyOutline,
  Sports: basketball,
  Other: ellipsisHorizontal,
};
const typeIcon = computed(() => typeIcons[props.workout.exerciseType] ?? ellipsisHorizontal);

const formattedDate = computed(() =>
  new Date(`${props.workout.date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
);
</script>

<style scoped>
.workout-card {
  display: block;
  margin: 0 16px 12px;
  border: var(--app-border-subtle);
  border-radius: var(--app-radius);
  overflow: hidden;
}

.workout-card ion-item {
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--ion-color-step-200);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-inline-end: 12px;
  color: var(--ion-color-primary);
  font-size: 18px;
  flex-shrink: 0;
}

h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  color: var(--ion-color-medium);
  font-size: 13px;
  margin: 0;
}

.meta-row ion-badge {
  --background: var(--ion-color-primary);
  --color: #ffffff;
  font-size: 10.5px;
  text-transform: uppercase;
}

.dot {
  opacity: 0.5;
}

.notes {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.chevron {
  color: var(--ion-color-step-350);
  font-size: 16px;
}
</style>
