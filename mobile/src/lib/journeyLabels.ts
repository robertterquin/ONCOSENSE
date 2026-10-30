import type { IconName } from '@/components/ui/Icon';

// Words for check-in values (redesign Phase 4). Started from add_entry_screen.dart.

function painWord(level: number): string {
  if (level <= 2) return 'mild';
  if (level <= 4) return 'moderate';
  if (level <= 6) return 'significant';
  if (level <= 8) return 'severe';
  return 'extreme';
}

function energyWord(level: number): string {
  if (level <= 2) return 'exhausted';
  if (level <= 4) return 'tired';
  if (level <= 6) return 'moderate';
  if (level <= 8) return 'energized';
  return 'full of energy';
}

/** "No pain", "3 of 10, moderate": shown beside the slider and read aloud. */
export function painValueText(level: number): string {
  return level === 0 ? 'No pain' : `${level} of 10, ${painWord(level)}`;
}

/** "6 of 10, moderate" */
export function energyValueText(level: number): string {
  return `${level} of 10, ${energyWord(level)}`;
}

/**
 * Mood choices for a check-in (`moodLevel` 1–5); also Today's quick mood buttons.
 * The redesign's gentler labels; stored values are unchanged. No colour per mood: the
 * face and label carry the meaning, and the app's violet marks the chosen one.
 */
export const MOODS = [
  { icon: 'mood-rough', label: 'Rough', value: 1 },
  { icon: 'mood-low', label: 'Low', value: 2 },
  { icon: 'mood-okay', label: 'Okay', value: 3 },
  { icon: 'mood-good', label: 'Good', value: 4 },
  { icon: 'mood-great', label: 'Great', value: 5 },
] as const satisfies readonly { icon: IconName; label: string; value: number }[];

/** How someone slept (`sleepQuality` 1–5). */
export const SLEEP = [
  { label: 'Very poor', value: 1 },
  { label: 'Poor', value: 2 },
  { label: 'Fair', value: 3 },
  { label: 'Good', value: 4 },
  { label: 'Very good', value: 5 },
];
