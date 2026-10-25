// Cancer awareness months, first shown on the Flutter home screen. Today links each
// one to its cancer type when Learn has one with the same name.

type AwarenessMonth = {
  emoji: string;
  month: string;
  /** Matches a cancer type's name when there is one ("Breast Cancer"). */
  title: string;
  subtitle: string;
};

const AWARENESS_MONTHS: AwarenessMonth[] = [
  {
    emoji: '🎗️',
    month: 'January',
    title: 'Cervical Cancer',
    subtitle: 'Know the signs and prevention methods',
  },
  {
    emoji: '🛡️',
    month: 'February',
    title: 'Cancer Prevention',
    subtitle: 'Healthy habits reduce your risk',
  },
  {
    emoji: '🎗️',
    month: 'March',
    title: 'Colorectal Cancer',
    subtitle: 'Early screening saves lives',
  },
  {
    emoji: '💪',
    month: 'April',
    title: 'Testicular Cancer',
    subtitle: 'Self-checks are important',
  },
  { emoji: '☀️', month: 'May', title: 'Skin Cancer', subtitle: 'Protect yourself from UV rays' },
  { emoji: '🧠', month: 'June', title: 'Brain Tumor', subtitle: 'Awareness and early detection' },
  { emoji: '👩', month: 'July', title: 'Ovarian Cancer', subtitle: 'Know the symptoms' },
  {
    emoji: '🗣️',
    month: 'August',
    title: 'Head & Neck Cancer',
    subtitle: 'Screening and prevention',
  },
  { emoji: '👩', month: 'September', title: 'Ovarian Cancer', subtitle: 'Support and awareness' },
  { emoji: '💗', month: 'October', title: 'Breast Cancer', subtitle: 'Early detection matters' },
  { emoji: '💨', month: 'November', title: 'Lung Cancer', subtitle: 'Learn about prevention' },
  {
    emoji: '🎗️',
    month: 'December',
    title: 'National Cancer',
    subtitle: 'Learn about early detection & prevention',
  },
];

export function awarenessForMonth(date: Date = new Date()): AwarenessMonth {
  return AWARENESS_MONTHS[date.getMonth()];
}
