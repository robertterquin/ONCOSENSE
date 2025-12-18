# Self-Check Guides Expansion for 10 Cancer Types

## Overview
This document provides additional self-check guides to complete the coverage of the 10 cancer types in the cancer information database. These guides are based on reliable medical sources and follow evidence-based guidelines.

## SQL Script to Add Missing Self-Check Guides

```sql
-- Add additional self-check guides for remaining cancer types
-- Run this in your Supabase SQL Editor after the initial prevention database setup

-- 5. Colorectal Self-Awareness Check
INSERT INTO self_check_guides (title, description, cancer_type, frequency, age_recommendation, steps, warning_signs, when_to_see_doctor, source_name, source_url, display_order) VALUES
('Colorectal Health Awareness', 'Monitor bowel health and recognize warning signs', 'Colorectal', 'Weekly', 'Adults 45+',
'[
  {"step": 1, "instruction": "Track bowel habits: Notice any changes in frequency or consistency", "detail": "Keep a mental note of your normal bowel patterns. Changes lasting more than a few days should be monitored."},
  {"step": 2, "instruction": "Check stool appearance: Look for blood, dark/tarry color, or unusual narrowing", "detail": "Before flushing, glance at stool color and consistency. Dark, tarry stools or bright red blood are warning signs."},
  {"step": 3, "instruction": "Monitor digestive symptoms: Note persistent bloating, cramping, or gas", "detail": "Occasional digestive issues are normal, but persistent symptoms lasting 2+ weeks need attention."},
  {"step": 4, "instruction": "Assess energy levels: Notice unexplained fatigue or weakness", "detail": "Iron-deficiency anemia from slow bleeding can cause persistent tiredness and pale skin."},
  {"step": 5, "instruction": "Track weight changes: Monitor for unexplained weight loss", "detail": "Unintentional weight loss of 10+ pounds without diet changes should be evaluated."}
]',
'[
  "Blood in stool (bright red or dark/tarry)",
  "Persistent change in bowel habits (diarrhea, constipation)",
  "Narrow stools (pencil-thin) lasting several days",
  "Feeling bowel doesn''t empty completely",
  "Persistent abdominal pain, cramping, or bloating",
  "Unexplained weight loss",
  "Constant fatigue or weakness",
  "Iron-deficiency anemia"
]',
'See a doctor if you notice blood in stool, persistent changes in bowel habits lasting more than 2 weeks, abdominal pain, or unexplained weight loss. Adults 45+ should get regular colonoscopy screening every 10 years, or earlier if symptoms develop.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/colon-rectal-cancer/detection-diagnosis-staging.html', 5),

-- 6. Cervical Health Awareness (Symptoms Monitoring)
('Cervical Health Monitoring', 'Track gynecological symptoms and screening schedule', 'Cervical', 'Monthly', 'Women 21-65',
'[
  {"step": 1, "instruction": "Schedule regular Pap tests: Every 3 years (ages 21-65)", "detail": "Mark your calendar for screening appointments. Pap tests detect precancerous changes before cancer develops."},
  {"step": 2, "instruction": "Monitor menstrual patterns: Track unusual bleeding between periods", "detail": "Note any bleeding between periods, after sex, or after menopause. Keep a menstrual calendar."},
  {"step": 3, "instruction": "Check vaginal discharge: Notice changes in color, odor, or consistency", "detail": "Normal discharge varies with cycle. Unusual discharge (watery, bloody, increased amount, foul odor) needs evaluation."},
  {"step": 4, "instruction": "Assess pelvic discomfort: Note any pain during intercourse or pelvic exams", "detail": "Persistent pelvic pain or pain during sex that is new or worsening should be reported."},
  {"step": 5, "instruction": "Know your HPV status: Get HPV vaccine and testing as recommended", "detail": "HPV vaccine prevents 90% of cervical cancers. Ask your doctor about HPV testing with Pap tests (ages 30-65)."}
]',
'[
  "Abnormal vaginal bleeding (between periods, after sex, after menopause)",
  "Unusual vaginal discharge (watery, bloody, foul-smelling)",
  "Pelvic pain or pain during intercourse",
  "Heavier or longer menstrual periods than normal",
  "Bleeding after douching",
  "Lower back pain (in advanced cases)"
]',
'Contact your gynecologist if you experience abnormal bleeding, unusual discharge, pelvic pain, or any concerning symptoms. Do not skip your regular Pap test appointments—screening saves lives by catching precancerous changes early.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/cervical-cancer/detection-diagnosis-staging.html', 6),

-- 7. Prostate Health Awareness
('Prostate Health Monitoring', 'Monitor urinary symptoms and screening decisions', 'Prostate', 'Weekly', 'Men 50+',
'[
  {"step": 1, "instruction": "Discuss PSA screening with your doctor: Ages 50-70, earlier if high risk", "detail": "PSA testing has benefits and risks. Make an informed decision with your doctor based on age and risk factors."},
  {"step": 2, "instruction": "Monitor urination frequency: Note increased nighttime bathroom trips", "detail": "Track how often you urinate, especially at night. Waking 2+ times nightly can indicate prostate issues."},
  {"step": 3, "instruction": "Assess urinary flow: Notice weak stream or difficulty starting/stopping", "detail": "Healthy flow is steady and strong. Weak stream, dribbling, or straining can signal prostate enlargement."},
  {"step": 4, "instruction": "Check for discomfort: Note any burning, pain, or blood during urination", "detail": "Pain during urination, blood in urine or semen, or pelvic discomfort should be evaluated promptly."},
  {"step": 5, "instruction": "Know your family history: Higher risk if father or brother had prostate cancer", "detail": "Family history doubles your risk. Discuss earlier screening (age 40-45) with doctor if high risk."}
]',
'[
  "Frequent urination, especially at night (3+ times)",
  "Difficulty starting or stopping urination",
  "Weak or interrupted urine flow",
  "Pain or burning during urination",
  "Blood in urine or semen",
  "Painful ejaculation",
  "Persistent pain in back, hips, or pelvis",
  "Erectile dysfunction (new onset)"
]',
'See a doctor if you experience urinary symptoms lasting more than 2 weeks, blood in urine or semen, or pelvic pain. Men 50+ should discuss PSA screening benefits and risks with their doctor. Black men and those with family history should start discussions at age 40-45.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/prostate-cancer/detection-diagnosis-staging.html', 7),

-- 8. Liver Health Monitoring
('Liver Health Awareness', 'Monitor liver function and risk factors', 'Liver', 'Monthly', 'High-risk adults',
'[
  {"step": 1, "instruction": "Know your hepatitis status: Get tested for hepatitis B and C", "detail": "Chronic hepatitis B/C are leading causes of liver cancer. Testing is simple and treatment can prevent cancer."},
  {"step": 2, "instruction": "Check for jaundice: Look at whites of eyes and skin tone in mirror", "detail": "Yellowing of eyes or skin (jaundice) indicates liver problems. Check in natural lighting monthly."},
  {"step": 3, "instruction": "Monitor abdominal changes: Feel for upper right abdominal fullness or pain", "detail": "The liver is in the upper right abdomen. New fullness, hardness, or persistent pain needs evaluation."},
  {"step": 4, "instruction": "Track energy and appetite: Note unusual fatigue or early fullness when eating", "detail": "Persistent fatigue, loss of appetite, or feeling full quickly can indicate liver issues."},
  {"step": 5, "instruction": "Assess lifestyle factors: Limit alcohol, maintain healthy weight", "detail": "Alcohol abuse and obesity increase liver cancer risk. No more than 1 drink/day for women, 2 for men."}
]',
'[
  "Jaundice (yellowing of skin and eyes)",
  "Upper right abdominal pain or fullness",
  "Abdominal swelling or bloating",
  "Unexplained weight loss or loss of appetite",
  "Nausea and vomiting",
  "Extreme fatigue and weakness",
  "White or pale stools",
  "Dark urine"
]',
'See a doctor immediately if you develop jaundice, severe abdominal pain, or unexplained weight loss. High-risk individuals (chronic hepatitis B/C, cirrhosis) should get ultrasound and AFP blood test every 6 months for screening.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/liver-cancer/detection-diagnosis-staging.html', 8),

-- 9. Stomach Health Awareness
('Stomach Health Monitoring', 'Recognize digestive warning signs early', 'Stomach', 'Weekly', 'Adults 50+',
'[
  {"step": 1, "instruction": "Get tested for H. pylori: Simple breath, blood, or stool test", "detail": "H. pylori infection causes 60-80% of stomach cancers. Testing and treatment can prevent cancer."},
  {"step": 2, "instruction": "Monitor indigestion: Track persistent heartburn or stomach discomfort", "detail": "Occasional indigestion is normal. Persistent symptoms lasting 2+ weeks despite antacids need evaluation."},
  {"step": 3, "instruction": "Check stool color: Look for black, tarry stools indicating bleeding", "detail": "Dark, tarry stools suggest upper GI bleeding. Bright red blood indicates lower GI source."},
  {"step": 4, "instruction": "Assess appetite and eating: Notice early fullness or difficulty swallowing", "detail": "Feeling full after small amounts of food or difficulty swallowing solid foods are warning signs."},
  {"step": 5, "instruction": "Track weight trends: Monitor unexplained weight loss", "detail": "Unintentional weight loss of 10+ pounds without diet changes warrants medical evaluation."}
]',
'[
  "Persistent indigestion or heartburn (2+ weeks)",
  "Feeling bloated or full after eating small amounts",
  "Loss of appetite or unintentional weight loss",
  "Nausea and vomiting",
  "Stomach pain or discomfort",
  "Blood in stool (black, tarry stools)",
  "Difficulty swallowing",
  "Vomiting blood or coffee-ground material"
]',
'See a doctor if you have persistent stomach symptoms lasting more than 2 weeks, difficulty swallowing, vomiting blood, black stools, or unexplained weight loss. High-risk individuals (H. pylori, family history) should discuss endoscopy screening.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/stomach-cancer/detection-diagnosis-staging.html', 9),

-- 10. Lung Health Awareness
('Lung Health Monitoring', 'Track respiratory symptoms and screening eligibility', 'Lung', 'Weekly', 'Current/former smokers',
'[
  {"step": 1, "instruction": "Know your screening eligibility: Ages 50-80 with 20+ pack-year smoking history", "detail": "Pack-years = packs per day × years smoked. 20 pack-years = 1 pack/day for 20 years or 2 packs/day for 10 years."},
  {"step": 2, "instruction": "Monitor cough: Track any new persistent cough or change in chronic cough", "detail": "Smoker''s cough changing character, lasting 2+ weeks, or producing blood needs immediate evaluation."},
  {"step": 3, "instruction": "Check breathing: Notice shortness of breath with normal activities", "detail": "New or worsening shortness of breath during activities you normally do easily is a warning sign."},
  {"step": 4, "instruction": "Assess chest symptoms: Note any chest pain, hoarseness, or wheezing", "detail": "Persistent chest pain with breathing, new hoarseness lasting 2+ weeks, or wheezing needs evaluation."},
  {"step": 5, "instruction": "Track respiratory infections: Notice frequent pneumonia or bronchitis", "detail": "Recurrent lung infections in the same area can indicate an underlying problem blocking the airway."}
]',
'[
  "Persistent cough that doesn''t go away or worsens",
  "Coughing up blood or rust-colored sputum",
  "Chest pain that worsens with breathing or coughing",
  "Shortness of breath or wheezing",
  "Hoarseness or voice changes lasting 2+ weeks",
  "Unexplained weight loss and fatigue",
  "Recurrent respiratory infections (pneumonia, bronchitis)",
  "Bone pain (in advanced cases)"
]',
'See a doctor immediately if you cough up blood, have persistent cough lasting 3+ weeks, chest pain, or unexplained weight loss. High-risk individuals (ages 50-80, 20+ pack-years smoking history, current smoker or quit within 15 years) should discuss annual low-dose CT screening.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/lung-cancer/detection-diagnosis-staging.html', 10),

-- 11. Ovarian Health Awareness
('Ovarian Health Monitoring', 'Recognize subtle symptoms early', 'Ovarian', 'Weekly', 'Women 50+',
'[
  {"step": 1, "instruction": "Know your family history: BRCA mutations increase risk to 40-50%", "detail": "Family history of ovarian or breast cancer, especially in multiple relatives, suggests genetic risk. Discuss genetic testing."},
  {"step": 2, "instruction": "Monitor abdominal symptoms: Track bloating lasting more than 2 weeks", "detail": "Persistent bloating (not related to menstrual cycle or diet) that occurs daily for 2+ weeks is a warning sign."},
  {"step": 3, "instruction": "Assess pelvic discomfort: Note any new pelvic or lower abdominal pain", "detail": "Persistent pelvic pressure, pain, or discomfort that is new and occurs frequently needs evaluation."},
  {"step": 4, "instruction": "Track eating patterns: Notice early fullness or difficulty eating normal amounts", "detail": "Feeling full quickly when eating or difficulty eating usual portion sizes that persists for weeks."},
  {"step": 5, "instruction": "Monitor urinary symptoms: Track increased frequency or urgency", "detail": "New urinary urgency or frequency (not due to infection) occurring frequently for 2+ weeks."}
]',
'[
  "Bloating or abdominal swelling that persists",
  "Pelvic or lower abdominal pain or pressure",
  "Feeling full quickly when eating (early satiety)",
  "Difficulty eating or loss of appetite",
  "Urinary symptoms (urgency, frequency) without infection",
  "Changes in bowel habits (constipation)",
  "Fatigue or unexplained weight loss",
  "Abnormal vaginal bleeding (especially after menopause)"
]',
'See a doctor if you have any combination of these symptoms occurring frequently (more than 12 times per month) for 2+ weeks: bloating, pelvic pain, feeling full quickly, or urinary symptoms. High-risk women (BRCA mutations, family history) should discuss surveillance with gynecologic oncologist.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/ovarian-cancer/detection-diagnosis-staging.html', 11),

-- 12. Leukemia Awareness (Blood Cancer)
('Blood Health Awareness', 'Monitor for signs of blood disorders', 'Leukemia', 'Monthly', 'All ages (especially children and seniors)',
'[
  {"step": 1, "instruction": "Track infections: Notice frequent or persistent infections", "detail": "Leukemia affects white blood cells that fight infection. Frequent infections or slow healing are warning signs."},
  {"step": 2, "instruction": "Check for bruising: Look for easy bruising or unusual bleeding", "detail": "Examine arms and legs for unexplained bruises. Notice frequent nosebleeds or bleeding gums when brushing."},
  {"step": 3, "instruction": "Assess energy levels: Monitor for persistent, unexplained fatigue", "detail": "Extreme tiredness not improved by rest, lasting weeks, interfering with normal activities."},
  {"step": 4, "instruction": "Check skin: Look for small red spots (petechiae) on skin", "detail": "Tiny red dots (petechiae) indicate bleeding under skin. Usually appear in clusters on legs, chest, or inside mouth."},
  {"step": 5, "instruction": "Feel lymph nodes: Gently check neck, armpits, and groin for swelling", "detail": "Use fingertips to feel for painless, firm lumps in neck, behind ears, armpits, or groin area."}
]',
'[
  "Frequent infections or fever",
  "Persistent fatigue and weakness",
  "Easy bruising or unusual bleeding",
  "Nosebleeds or bleeding gums",
  "Small red spots on skin (petechiae)",
  "Swollen lymph nodes (neck, armpits, groin)",
  "Bone or joint pain",
  "Unexplained weight loss",
  "Night sweats",
  "Pale skin"
]',
'See a doctor promptly if you have persistent fatigue, frequent infections, easy bruising, unexplained bleeding, swollen lymph nodes, or bone pain. Leukemia is often detected through routine blood tests (CBC). There is no standard screening—diagnosis is usually made when investigating symptoms.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/leukemia/detection-diagnosis-staging.html', 12);
```

## Verification Query

After running the above SQL, verify all guides are inserted:

```sql
-- Check all self-check guides
SELECT cancer_type, title, frequency, age_recommendation 
FROM self_check_guides 
WHERE is_active = true 
ORDER BY display_order;
```

You should now have 12 self-check guides covering all 10 cancer types from the cancer information database:

1. **Breast Cancer** - Breast Self-Exam
2. **Skin Cancer** - Skin Cancer ABCDE Check
3. **Oral** (not in main 10, but valuable) - Oral Cancer Self-Check
4. **Testicular** (not in main 10, but valuable) - Testicular Self-Exam
5. **Colorectal Cancer** - Colorectal Health Awareness
6. **Cervical Cancer** - Cervical Health Monitoring
7. **Prostate Cancer** - Prostate Health Monitoring
8. **Liver Cancer** - Liver Health Monitoring
9. **Stomach Cancer** - Stomach Health Monitoring
10. **Lung Cancer** - Lung Health Monitoring
11. **Ovarian Cancer** - Ovarian Health Awareness
12. **Leukemia** - Blood Health Awareness

## Important Notes

### Source Reliability
All guides reference the American Cancer Society (https://www.cancer.org), one of the most trusted sources for cancer information. Each source URL links directly to the detection and screening section for that specific cancer type.

### Self-Check vs. Medical Screening
- **Self-checks** help with awareness and early symptom recognition
- They do NOT replace professional medical screening (mammograms, colonoscopies, PSA tests, etc.)
- Some cancers (lung, liver, ovarian, stomach, leukemia) have no effective self-examination—these guides focus on symptom awareness

### Limitations
- **Lung, liver, stomach, ovarian, leukemia, and colorectal cancers** cannot be detected by physical self-examination
- These guides focus on **symptom monitoring** and **screening awareness**
- Always emphasize the importance of professional screening for high-risk individuals

### Age Recommendations
- Age recommendations reflect current screening guidelines and risk profiles
- High-risk individuals (family history, genetic mutations, chronic conditions) may need earlier or more frequent monitoring

## Testing in Flutter App

After running the SQL:

1. The prevention screen will automatically load these new guides
2. Each guide displays with its cancer type, frequency, and age recommendation
3. Tapping a guide opens the detailed bottom sheet with step-by-step instructions
4. Source attribution is displayed with clickable links

## Future Maintenance

- Review guides annually to align with updated cancer screening guidelines
- Update `date_verified` timestamp when reviewing
- Adjust age recommendations if guidelines change (e.g., colorectal screening age was recently lowered from 50 to 45)
- Add new guides for other cancer types as needed
