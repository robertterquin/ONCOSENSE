// Slider colors and labels from add_entry_screen.dart.

export function painColor(level: number) {
  if (level <= 2) return '#4CAF50';
  if (level <= 4) return '#FBC02D';
  if (level <= 6) return '#FF9800';
  return '#F44336';
}

export function painLabel(level: number) {
  if (level === 0) return 'No pain';
  const word =
    level <= 2
      ? 'Mild'
      : level <= 4
        ? 'Moderate'
        : level <= 6
          ? 'Significant'
          : level <= 8
            ? 'Severe'
            : 'Extreme';
  return `${level}/10 (${word})`;
}

export function energyColor(level: number) {
  if (level <= 2) return '#F44336';
  if (level <= 4) return '#FF9800';
  if (level <= 6) return '#FBC02D';
  if (level <= 8) return '#8BC34A';
  return '#4CAF50';
}

export function energyLabel(level: number) {
  const word =
    level <= 2
      ? 'Exhausted'
      : level <= 4
        ? 'Tired'
        : level <= 6
          ? 'Moderate'
          : level <= 8
            ? 'Energized'
            : 'Full Energy';
  return `${level}/10 (${word})`;
}
