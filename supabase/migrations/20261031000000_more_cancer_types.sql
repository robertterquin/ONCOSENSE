-- Five more cancer types (Learn › Cancers). Testicular and oral already have self-check
-- guides but no page; thyroid, lymphoma and uterine are common in the Philippines.
-- Content follows the American Cancer Society (cancer.org), the National Cancer
-- Institute (cancer.gov) and WHO fact sheets. Needs a clinician's review before release.
-- Safe to run twice: each row is only added when no cancer of that name exists.

insert into public.cancer_types
  (name, description, icon_name, symptoms, risk_factors, prevention_tips, screening_methods, early_detection_info, statistics)
select v.* from (values

('Testicular cancer',
'Testicular cancer starts in one or both testicles. It is rare overall but one of the most common cancers in young men, and it is one of the most curable cancers, even when it has spread.',
'medical_information',
array[
  'A painless lump or swelling in a testicle',
  'A feeling of heaviness in the scrotum',
  'A dull ache in the lower belly or groin',
  'Sudden swelling or fluid in the scrotum',
  'Pain or discomfort in a testicle or the scrotum',
  'Breast tenderness or growth (rare)'
],
array[
  'Age 15 to 35 (most cases)',
  'An undescended testicle, even if corrected',
  'Family history (father or brother)',
  'Having had cancer in the other testicle',
  'HIV infection'
],
array[
  'There is no known way to prevent most cases',
  'Get to know how your testicles normally feel',
  'If a son has an undescended testicle, follow the doctor''s advice on treatment',
  'See a doctor soon about any lump, swelling or change'
],
array[
  'Testicular self-exam (knowing what is normal for you)',
  'Physical exam by a doctor',
  'Ultrasound of the scrotum',
  'Blood tests for tumor markers (AFP, hCG, LDH)'
],
'Most testicular cancers are found by men themselves as a painless lump. There is no routine screening test, so knowing how your testicles normally feel and seeing a doctor promptly about any change is the best way to find it early.',
'One of the most common cancers in men aged 15 to 35. More than 9 in 10 men are cured, and the outlook is best when it is found early.'
),

('Oral cancer',
'Oral (mouth) cancer can start on the lips, tongue, gums, cheeks, floor or roof of the mouth. Tobacco in any form, chewing betel quid (nganga) and alcohol cause most mouth cancers, and the risk is highest when they are combined.',
'medical_information',
array[
  'A sore or ulcer in the mouth that does not heal within 2 weeks',
  'A white or red patch on the gums, tongue or lining of the mouth',
  'A lump or thickening in the cheek or neck',
  'Pain, numbness or bleeding in the mouth',
  'Trouble chewing, swallowing or moving the tongue or jaw',
  'Loose teeth or dentures that no longer fit',
  'A lasting sore throat or change in voice'
],
array[
  'Smoking or chewing tobacco',
  'Chewing betel quid (nganga), with or without tobacco',
  'Drinking alcohol, especially with tobacco',
  'HPV infection (mainly the back of the throat)',
  'Too much sun on the lips',
  'Being over 40'
],
array[
  'Do not smoke or chew tobacco',
  'Do not chew betel quid',
  'Limit alcohol, or avoid it',
  'Get the HPV vaccine if you are eligible',
  'Use lip balm with sunscreen outdoors',
  'Have regular dental check-ups'
],
array[
  'Mouth check by a dentist or doctor',
  'Looking at your own mouth for sores or patches',
  'Biopsy of any suspicious area',
  'Scans (CT or MRI) to check how far it has spread'
],
'Dentists can often spot mouth cancer or changes that may turn into cancer during a routine check-up. See a dentist or doctor about any mouth sore, patch or lump that lasts more than 2 weeks.',
'Tobacco, betel quid and alcohol cause most mouth cancers. When found early, most can be treated successfully.'
),

('Thyroid cancer',
'Thyroid cancer starts in the thyroid, a butterfly-shaped gland at the front of the neck that makes hormones. Most types grow slowly and are very treatable. It is about three times more common in women than in men.',
'medical_information',
array[
  'A lump or swelling at the front of the neck',
  'Swollen glands in the neck',
  'Hoarseness or voice changes that do not go away',
  'Trouble swallowing or breathing',
  'A lasting cough not caused by a cold',
  'Pain in the front of the neck'
],
array[
  'Being female',
  'Radiation to the head or neck, especially in childhood',
  'Family history of thyroid cancer',
  'Certain inherited conditions (such as MEN2)',
  'Low iodine in the diet (for some types)'
],
array[
  'There is no proven way to prevent most cases',
  'Avoid radiation to the head and neck that is not medically needed',
  'Use iodized salt',
  'If thyroid cancer runs in your family, ask a doctor about genetic testing'
],
array[
  'Neck exam by a doctor',
  'Ultrasound of the thyroid',
  'Fine-needle biopsy of a lump',
  'Blood tests for thyroid function'
],
'Screening people without symptoms is not recommended, because many small thyroid cancers never cause harm. See a doctor about a neck lump, or a hoarse voice or trouble swallowing that does not go away.',
'About three times more common in women than in men. Most thyroid cancers grow slowly, and 5-year survival is over 98% for the most common types.'
),

('Lymphoma',
'Lymphoma is a cancer of the lymph system, which helps the body fight infection. It starts in white blood cells called lymphocytes. The two main types are Hodgkin lymphoma and non-Hodgkin lymphoma, which is more common.',
'medical_information',
array[
  'Painless swelling of lymph nodes in the neck, armpit or groin',
  'Fever that comes and goes without an infection',
  'Drenching night sweats',
  'Unexplained weight loss',
  'Tiredness that does not get better',
  'Itchy skin',
  'Cough, chest pain or shortness of breath'
],
array[
  'Older age (non-Hodgkin) or ages 20 to 40 (Hodgkin)',
  'A weakened immune system, such as from HIV or after an organ transplant',
  'Certain infections, such as Epstein-Barr virus or H. pylori',
  'Autoimmune diseases',
  'Family history of lymphoma'
],
array[
  'There is no proven way to prevent most cases',
  'Lower your risk of HIV (safer sex, not sharing needles)',
  'Get treated for H. pylori if a doctor finds it',
  'See a doctor about swollen glands that last more than 2 weeks'
],
array[
  'Physical exam of the lymph nodes',
  'Biopsy of a lymph node',
  'Blood tests',
  'Scans (CT or PET) to see where it is'
],
'There is no screening test for lymphoma. Swollen lymph nodes are usually caused by infection, but see a doctor about any that last more than 2 weeks, or come with fever, night sweats or weight loss.',
'Hodgkin lymphoma is one of the most curable cancers, with about 9 in 10 people alive 5 years later. Many types of non-Hodgkin lymphoma can also be treated well.'
),

('Uterine cancer',
'Uterine cancer starts in the uterus (womb). Most cases start in its lining and are called endometrial cancer. It mostly affects women after menopause, and abnormal bleeding usually appears early, so it is often found at an early stage.',
'medical_information',
array[
  'Bleeding after menopause, even a little',
  'Bleeding between periods or very heavy periods',
  'Unusual vaginal discharge',
  'Pain in the pelvis or lower belly',
  'Pain during sex',
  'A lump or mass in the pelvis'
],
array[
  'Being over 50 or past menopause',
  'Excess body weight',
  'Estrogen therapy without progesterone',
  'Diabetes',
  'Never having been pregnant',
  'Polycystic ovary syndrome (PCOS)',
  'Family history, including Lynch syndrome'
],
array[
  'Stay at a healthy weight',
  'Be active most days',
  'Talk to a doctor before taking hormone therapy',
  'Ask a doctor about birth control pills, which lower the risk',
  'Report any bleeding after menopause to a doctor'
],
array[
  'Pelvic exam',
  'Transvaginal ultrasound',
  'Endometrial biopsy',
  'Hysteroscopy'
],
'There is no routine screening test for women at average risk. Bleeding after menopause is not normal and should always be checked by a doctor. Women with Lynch syndrome may be offered yearly testing.',
'Abnormal bleeding usually appears early, so most uterine cancers are found at an early stage, when more than 9 in 10 women survive 5 years.'
)

) as v(name, description, icon_name, symptoms, risk_factors, prevention_tips, screening_methods, early_detection_info, statistics)
where not exists (
  select 1 from public.cancer_types c where lower(c.name) = lower(v.name)
);
