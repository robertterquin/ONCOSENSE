// Icon per cancer type, by name (same rules as the Flutter Info screen).

const RULES: [string[], string][] = [
  [['breast'], 'favorite'],
  [['lung'], 'air'],
  [['prostate'], 'man'],
  [['cervical', 'ovarian', 'uterine'], 'woman'],
  [['colorectal', 'colon', 'rectal'], 'restaurant'],
  [['skin', 'melanoma'], 'wb_sunny'],
  [['liver'], 'water_drop'],
  [['pancre'], 'biotech'],
  [['kidney', 'renal'], 'healing'],
  [['bladder'], 'bubble_chart'],
  [['brain', 'glioma'], 'psychology'],
  [['thyroid'], 'accessible'],
  [['leukemia', 'lymphoma', 'blood'], 'bloodtype'],
  [['stomach', 'gastric'], 'set_meal'],
  [['esophag'], 'local_dining'],
  [['bone', 'sarcoma'], 'accessibility_new'],
  [['oral', 'mouth', 'tongue'], 'record_voice_over'],
];

/** Material icon name for a cancer type. */
export function cancerTypeIcon(name: string): string {
  const lower = name.toLowerCase();
  return (
    RULES.find(([words]) => words.some((word) => lower.includes(word)))?.[1] ??
    'medical_information'
  );
}
