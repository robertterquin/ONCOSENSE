import type { HealthTip } from '@/types/healthTip';

// The weekly tip notification. Each tip states only what its source says, and the source
// is named in the notification. Reviewed 2026-10-31 against the sources named; a
// clinician should review them before release.
export const HEALTH_TIPS: HealthTip[] = [
  {
    tip: 'Tobacco is the biggest avoidable cause of cancer. Quitting at any age lowers your risk.',
    category: 'Prevention',
    source: 'WHO',
  },
  {
    tip: 'Alcohol causes at least seven types of cancer, and for cancer no amount is safe.',
    category: 'Prevention',
    source: 'WHO',
  },
  {
    tip: 'Being active lowers the risk of colon, breast and endometrial cancer. Aim for 150 minutes a week.',
    category: 'Exercise',
    source: 'American Cancer Society',
  },
  {
    tip: 'Excess body fat is linked to at least 13 types of cancer.',
    category: 'Weight',
    source: 'American Cancer Society',
  },
  {
    tip: 'Fill half your plate with vegetables, fruit, whole grains and beans.',
    category: 'Nutrition',
    source: 'World Cancer Research Fund',
  },
  {
    tip: 'Processed meat causes colorectal cancer. Eat as little of it as you can.',
    category: 'Nutrition',
    source: 'WHO (IARC)',
  },
  {
    tip: 'The HPV vaccine prevents most cervical cancers. It works best before age 15.',
    category: 'Prevention',
    source: 'WHO',
  },
  {
    tip: 'The hepatitis B vaccine prevents hepatitis B, a leading cause of liver cancer.',
    category: 'Prevention',
    source: 'WHO',
  },
  {
    tip: 'Between 10 a.m. and 4 p.m., use shade, sleeves and sunscreen of SPF 30 or more.',
    category: 'Prevention',
    source: 'Skin Cancer Foundation',
  },
  {
    tip: 'Using sunbeds before age 35 raises the risk of melanoma by about 75%.',
    category: 'Prevention',
    source: 'WHO (IARC)',
  },
  {
    tip: 'From age 30, an HPV test every 5 to 10 years can find changes before they become cervical cancer.',
    category: 'Screening',
    source: 'WHO',
  },
  {
    tip: 'From age 45, ask a doctor about colorectal cancer screening.',
    category: 'Screening',
    source: 'American Cancer Society',
  },
  {
    tip: 'Tell your doctor if close relatives had cancer. Some cancers run in families.',
    category: 'Awareness',
    source: 'National Cancer Institute',
  },
  {
    tip: "See a doctor about a lump, a sore that won't heal, unusual bleeding or weight loss you can't explain.",
    category: 'Awareness',
    source: 'American Cancer Society',
  },
  {
    tip: "Breastfeeding lowers the mother's risk of breast cancer.",
    category: 'Prevention',
    source: 'World Cancer Research Fund',
  },
  {
    tip: 'Radon and workplace chemicals such as asbestos cause lung cancer. Use protective equipment at work.',
    category: 'Safety',
    source: 'WHO',
  },
];
