// Cancer awareness months, first shown on the Flutter home screen. Today links each
// one to its cancer type when Learn has one with the same name.

type AwarenessMonth = {
  month: string;
  /** Matches a cancer type's name when there is one ("Breast Cancer"). */
  title: string;
  subtitle: string;
};

const AWARENESS_MONTHS: AwarenessMonth[] = [
  {
    month: 'January',
    title: 'Cervical Cancer',
    subtitle: 'Know the signs and prevention methods',
  },
  {
    month: 'February',
    title: 'Cancer Prevention',
    subtitle: 'Healthy habits reduce your risk',
  },
  {
    month: 'March',
    title: 'Colorectal Cancer',
    subtitle: 'Early screening saves lives',
  },
  {
    month: 'April',
    title: 'Testicular Cancer',
    subtitle: 'Self-checks are important',
  },
  { month: 'May', title: 'Skin Cancer', subtitle: 'Protect yourself from UV rays' },
  { month: 'June', title: 'Brain Tumor', subtitle: 'Awareness and early detection' },
  { month: 'July', title: 'Ovarian Cancer', subtitle: 'Know the symptoms' },
  {
    month: 'August',
    title: 'Head & Neck Cancer',
    subtitle: 'Screening and prevention',
  },
  { month: 'September', title: 'Ovarian Cancer', subtitle: 'Support and awareness' },
  { month: 'October', title: 'Breast Cancer', subtitle: 'Early detection matters' },
  { month: 'November', title: 'Lung Cancer', subtitle: 'Learn about prevention' },
  {
    month: 'December',
    title: 'National Cancer',
    subtitle: 'Learn about early detection & prevention',
  },
];

export function awarenessForMonth(date: Date = new Date()): AwarenessMonth {
  return AWARENESS_MONTHS[date.getMonth()];
}
