-- Content sources and corrections (content audit, 2026-11-01). Safe to run twice.
--
-- 1. Cancer pages name their source, and US figures say "In the US". Corrections:
--    hepatitis B vaccine (prevents the infection, not "90% of liver cancers"),
--    prostate (second in men worldwide; first in the US), breast (the American Cancer
--    Society no longer recommends routine monthly self-exams), skin (sunbeds before 35).
-- 2. Self-checks: only skin, oral, testicular and breast stay. The other eight set a
--    weekly or monthly routine that their cited pages don't recommend; their warning
--    signs are already on each cancer page.
-- 3. Help contacts: the Philippine Cancer Society number was wrong, and contacts show
--    when their number was last checked.
-- A clinician should review this before release.

-- 1. Cancer pages
alter table public.cancer_types add column if not exists source_name text;
alter table public.cancer_types add column if not exists source_url text;

update public.cancer_types set
  source_name = 'American Cancer Society',
  source_url = 'https://www.cancer.org/cancer/types/' || case lower(name)
    when 'breast cancer' then 'breast-cancer'
    when 'lung cancer' then 'lung-cancer'
    when 'colorectal cancer' then 'colon-rectal-cancer'
    when 'prostate cancer' then 'prostate-cancer'
    when 'cervical cancer' then 'cervical-cancer'
    when 'liver cancer' then 'liver-cancer'
    when 'stomach cancer' then 'stomach-cancer'
    when 'skin cancer' then 'melanoma-skin-cancer'
    when 'leukemia' then 'leukemia'
    when 'ovarian cancer' then 'ovarian-cancer'
    when 'testicular cancer' then 'testicular-cancer'
    when 'oral cancer' then 'oral-cavity-and-oropharyngeal-cancer'
    when 'thyroid cancer' then 'thyroid-cancer'
    when 'lymphoma' then 'hodgkin-lymphoma'
    when 'uterine cancer' then 'endometrial-cancer'
  end || '.html'
where lower(name) in (
  'breast cancer', 'lung cancer', 'colorectal cancer', 'prostate cancer', 'cervical cancer',
  'liver cancer', 'stomach cancer', 'skin cancer', 'leukemia', 'ovarian cancer',
  'testicular cancer', 'oral cancer', 'thyroid cancer', 'lymphoma', 'uterine cancer'
);

update public.cancer_types set statistics = case lower(name)
  when 'breast cancer' then 'Most common cancer in women worldwide. In the US, 1 in 8 women develop breast cancer in their lifetime, and 5-year survival is 99% when found before it spreads, 86% after it reaches nearby areas and 29% once it has spread far.'
  when 'lung cancer' then 'Leading cause of cancer death worldwide. In the US, 5-year survival is 63% when found before it spreads, 35% after it reaches nearby areas and 7% once it has spread far. Smoking is linked to 80 to 90% of cases.'
  when 'colorectal cancer' then 'Third most common cancer worldwide. In the US, 5-year survival is 91% when found before it spreads, 72% after it reaches nearby areas and 14% once it has spread far. Screening can find polyps before they turn into cancer.'
  when 'prostate cancer' then 'Second most common cancer in men worldwide, and the most common in US men after skin cancer. In the US, about 1 in 8 men are diagnosed in their lifetime; 5-year survival is nearly 100% unless it has spread far, when it is 31%.'
  when 'cervical cancer' then 'Highly preventable with the HPV vaccine and screening. The HPV vaccine can prevent over 90% of cancers caused by HPV. In the US, 5-year survival is 92% when found before it spreads, 58% after it reaches nearby areas and 18% once it has spread far.'
  when 'liver cancer' then 'More common in Asia and Africa. Long-term hepatitis B and C infections cause most liver cancers, and the hepatitis B vaccine prevents hepatitis B. In the US, 5-year survival is 36% when found before it spreads and 3% once it has spread far.'
  when 'stomach cancer' then 'More common in East Asia, Eastern Europe and South America. H. pylori infection causes most stomach cancers, and it can be treated. In the US, 5-year survival is 75% when found before it spreads and 7% once it has spread far.'
  when 'skin cancer' then 'Most common cancer in the US, where about 1 in 5 people develop skin cancer by age 70. In the US, melanoma 5-year survival is 99% when found before it spreads and 30% once it has spread far. Using sunbeds before age 35 raises melanoma risk by about 75%.'
  when 'leukemia' then 'Most common cancer in children. In the US, about 9 in 10 children with acute lymphoblastic leukemia (ALL) survive 5 years; for adults, 5-year survival is 88% for chronic lymphocytic leukemia (CLL) and about 30% for acute myeloid leukemia (AML).'
  when 'ovarian cancer' then 'Fifth leading cause of cancer death in US women. Only about 1 in 5 are found early, when 5-year survival is 93%; once it has spread far, it is 31%. Inherited BRCA changes raise lifetime risk to about 40 to 50%.'
  else statistics
end
where lower(name) in (
  'breast cancer', 'lung cancer', 'colorectal cancer', 'prostate cancer', 'cervical cancer',
  'liver cancer', 'stomach cancer', 'skin cancer', 'leukemia', 'ovarian cancer'
);

update public.cancer_types set
  early_detection_info = 'Know how your breasts normally look and feel, and see a doctor promptly about any change. The American Cancer Society says self-exams alone are not enough for screening: women at average risk can start yearly mammograms at 40 and should by 45. Ask a doctor what suits your age and risk.',
  screening_methods = array[
    'Knowing how your breasts normally look and feel',
    'Mammogram (yearly from 45, or from 40 if you choose)',
    'Clinical breast exam by a health worker',
    'MRI for women at high risk',
    'Genetic testing if your family history suggests it'
  ],
  prevention_tips = array[
    'Maintain a healthy weight',
    'Be active (at least 150 minutes a week)',
    'Limit alcohol, or avoid it',
    'Breastfeed if you can',
    'Talk to a doctor about the risks of hormone therapy',
    'Know your family history',
    'Report any breast change to a doctor',
    'Get mammograms as recommended for your age'
  ],
  source_url = 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-recommendations-for-the-early-detection-of-breast-cancer.html'
where lower(name) = 'breast cancer';

update public.cancer_types set
  screening_methods = array[
    'Checking your own skin each month (ABCDE rule)',
    'Skin exam by a doctor if you are at high risk or a spot changes',
    'Photos to track moles over time',
    'Biopsy of a suspicious spot'
  ],
  prevention_tips = array[
    'Stay in the shade between 10 a.m. and 4 p.m.',
    'Use broad-spectrum sunscreen of SPF 30 or more',
    'Reapply sunscreen every 2 hours outdoors',
    'Wear long sleeves and a hat',
    'Never use sunbeds',
    'Check your skin each month',
    'See a doctor about a mole that changes'
  ]
where lower(name) = 'skin cancer';

-- 2. Self-checks
update public.self_check_guides set is_active = false
where cancer_type in ('Colorectal', 'Cervical', 'Prostate', 'Liver', 'Stomach', 'Lung', 'Ovarian', 'Leukemia');

update public.self_check_guides set
  title = 'Breast self-check',
  description = 'Get to know how your breasts normally look and feel',
  source_url = 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-recommendations-for-the-early-detection-of-breast-cancer.html',
  date_verified = now()
where id = 'a0c16896-9f80-428d-a535-808f74414907';

update public.self_check_guides set
  description = 'Get to know how your testicles normally feel',
  date_verified = now()
where id = 'c9388ecf-d045-4199-b2ef-18c7b51ba649';

-- 3. Help contacts
alter table public.resources add column if not exists checked_on date;

update public.resources set phone = '(02) 8734-2126'
where id = '8eecb2b6-712e-4a68-b759-f0fa93b5ba48';

-- Checked against official or several independent sources on 2026-11-01.
update public.resources set checked_on = date '2026-11-01'
where id in (
  '1854bc6b-5744-4d54-908e-b88b064c7355', -- Department of Health, 1555
  '8eecb2b6-712e-4a68-b759-f0fa93b5ba48', -- Philippine Cancer Society, patient services
  '2b162d19-350a-4dc6-8726-df44ebfa7b63', -- NCMH crisis hotline
  '22444ae3-9564-401a-aac4-0c1a1f65a8fe'  -- Philippine Red Cross, 143
);
