import type { PreventionTip } from '@/types/preventionTip';

// The habits in Learn › Habits, reviewed against WHO, WCRF/AICR, the American Cancer
// Society and the 2019 exercise guidelines for cancer survivors. They used to come from
// the `prevention_tips` table; they live here so their wording is reviewed with the code.
// Habits carried over keep that table's id, so earlier ticks and bookmarks still match.

/** `daily`: ticked each day. `once`: done once and stays done. `wellbeing`: no tick. */
export type HabitKind = 'daily' | 'once' | 'wellbeing';
/** `prevention` for everyone not in treatment, `treatment` while in treatment. */
export type HabitAudience = 'prevention' | 'treatment' | 'all';

export type Habit = PreventionTip & {
  kind: HabitKind;
  audience: HabitAudience;
  /** Only offered to people who said they smoke. */
  smokersOnly?: boolean;
};

type HabitInput = Omit<Habit, 'iconName' | 'dateVerified' | 'displayOrder' | 'isActive'>;

const habit = (input: HabitInput, index: number): Habit => ({
  ...input,
  iconName: '',
  dateVerified: null,
  displayOrder: index,
  isActive: true,
});

const WCRF = 'https://www.wcrf.org/diet-and-cancer/recommendations/';

export const HABITS: Habit[] = (
  [
    {
      id: 'a209d639-07ad-45c8-ac45-95006b6af3ff',
      kind: 'daily',
      audience: 'prevention',
      category: 'Diet',
      title: 'Eat plants',
      description: 'Vegetables, fruit, whole grains and beans',
      detailedInfo:
        'Meals built on whole grains, vegetables, fruit and beans lower the risk of several cancers, including colorectal cancer. Fill half your plate with vegetables and fruit, choose whole grains, and keep red and processed meat to a little.',
      sourceName: 'World Cancer Research Fund',
      sourceUrl: WCRF,
    },
    {
      id: 'cc802d6d-66a2-4b06-b02e-947355ae16b7',
      kind: 'daily',
      audience: 'prevention',
      category: 'Exercise',
      title: 'Move 30 minutes',
      description: 'A brisk walk counts',
      detailedInfo:
        'Being active lowers the risk of colon, breast and endometrial cancer. Aim for 150 minutes a week, about 30 minutes on five days, and sit less: get up and move every hour.',
      sourceName: 'American Cancer Society',
      sourceUrl: 'https://www.cancer.org/healthy/eat-healthy-get-active.html',
    },
    {
      id: '65f3e030-2083-4f02-b561-f059f0608e09',
      kind: 'daily',
      audience: 'prevention',
      category: 'Lifestyle',
      title: 'Alcohol-free day',
      description: 'For cancer, the safest amount is none',
      detailedInfo:
        'Alcohol causes at least seven types of cancer, including breast, liver and colorectal cancer. There is no safe amount, so every day without it lowers your risk.',
      sourceName: 'World Health Organization (WHO)',
      sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/alcohol',
    },
    {
      id: '5aadac4d-dc85-438d-ae8a-f8d08d41d1d4',
      kind: 'daily',
      audience: 'prevention',
      category: 'Lifestyle',
      title: 'Sun-safe outside',
      description: 'Shade, sleeves and sunscreen',
      detailedInfo:
        "The sun's UV rays cause most skin cancers. Between 10 a.m. and 4 p.m., stay in the shade, cover up with sleeves and a hat, and use sunscreen of SPF 30 or higher.",
      sourceName: 'Skin Cancer Foundation',
      sourceUrl: 'https://www.skincancer.org/skin-cancer-prevention/',
    },
    {
      id: '9a1536e0-968d-4d38-a9f9-c3f4e872bfa9',
      kind: 'daily',
      audience: 'prevention',
      smokersOnly: true,
      category: 'Lifestyle',
      title: 'Smoke-free day',
      description: 'No cigarettes or vapes today',
      detailedInfo:
        'Tobacco is the biggest single cause of cancer. Stopping at any age lowers your risk, and every smoke-free day counts. A doctor or health center can help you quit.',
      sourceName: 'National Cancer Institute (NCI)',
      sourceUrl: 'https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco',
    },
    {
      id: 'gentle-movement',
      kind: 'daily',
      audience: 'treatment',
      category: 'Exercise',
      title: 'Gentle movement',
      description: 'A short walk or a stretch',
      detailedInfo:
        "Light activity during and after treatment can ease tiredness, anxiety and low mood. Start small, rest when you need to, and ask your care team what's safe for you.",
      sourceName: 'Exercise guidelines for cancer survivors (2019)',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31626055/',
    },
    {
      id: 'eat-something',
      kind: 'daily',
      audience: 'treatment',
      category: 'Diet',
      title: 'Eat something you enjoy',
      description: 'Small meals count on hard days',
      detailedInfo:
        'Eating enough helps you keep your strength during treatment. Small, frequent meals can be easier. If eating is hard or you are losing weight, tell your care team.',
      sourceName: 'American Cancer Society',
      sourceUrl: 'https://doi.org/10.3322/caac.21719',
    },
    {
      id: 'c79cc8a3-382c-4996-bba8-f3bc616ddb66',
      kind: 'once',
      audience: 'prevention',
      category: 'Prevention',
      title: 'HPV vaccine',
      description: 'Protects against cervical and other cancers',
      detailedInfo:
        "The HPV vaccine prevents most cervical cancers and some throat and genital cancers. It works best before age 15; adults can ask a doctor whether it's right for them.",
      sourceName: 'World Health Organization (WHO)',
      sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/cancer',
    },
    {
      id: 'hepatitis-b-vaccine',
      kind: 'once',
      audience: 'prevention',
      category: 'Prevention',
      title: 'Hepatitis B vaccine',
      description: 'Protects against liver cancer',
      detailedInfo:
        "Hepatitis B infection can lead to liver cancer, and the vaccine prevents it. Ask a doctor or health center if you're not sure you've had it.",
      sourceName: 'World Health Organization (WHO)',
      sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/hepatitis-b',
    },
    {
      id: '485c7247-5446-4890-995d-50e53a84d331',
      kind: 'once',
      audience: 'prevention',
      category: 'Screening',
      title: 'Screening for your age',
      description: 'Ask about cervical, breast and colorectal screening',
      detailedInfo:
        'Screening finds some cancers early, when they are easier to treat, and can find cervical and colorectal changes before they become cancer. Ask a doctor which tests suit your age.',
      sourceName: 'Centers for Disease Control (CDC)',
      sourceUrl: 'https://www.cdc.gov/cancer/dcpc/prevention/screening.htm',
    },
    {
      id: '5396337a-8dca-444d-b8b0-f0382c33b6fd',
      kind: 'once',
      audience: 'prevention',
      category: 'Weight',
      title: 'Know your healthy weight',
      description: 'Excess body fat is linked to 13 cancers',
      detailedInfo:
        'Excess body fat raises the risk of at least 13 cancers. Ask a health worker to check your weight and waist, and let the daily habits do the rest.',
      sourceName: 'American Cancer Society',
      sourceUrl:
        'https://www.cancer.org/healthy/eat-healthy-get-active/take-action/cancer-risk-and-weight.html',
    },
    {
      id: '6cbd74e3-3623-4860-8473-4eb7c8bb64dd',
      kind: 'wellbeing',
      audience: 'all',
      category: 'Wellbeing',
      title: 'Sleep 7 to 9 hours',
      description: 'Helps energy, mood and recovery',
      detailedInfo:
        "Good sleep helps energy, mood and recovery. Studies haven't shown that sleep length changes cancer risk, so this one is for feeling well.",
      sourceName: 'Mayo Clinic',
      sourceUrl:
        'https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/sleep/art-20048379',
    },
    {
      id: 'a016f51d-5536-494a-be87-7301b9d76073',
      kind: 'wellbeing',
      audience: 'all',
      category: 'Hydration',
      title: 'Stay hydrated',
      description: 'Drink when thirsty, more in the heat',
      detailedInfo:
        "How much water you need depends on the weather, how active you are and your health. During treatment, follow your care team's advice on fluids.",
      sourceName: 'Mayo Clinic',
      sourceUrl:
        'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256',
    },
  ] satisfies HabitInput[]
).map(habit);

/** How many daily habits someone tracks at once. */
export const MAX_TRACKED = 3;
