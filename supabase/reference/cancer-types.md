# Supabase Cancer Information Setup

## Table Structure

You need to create a table called `cancer_types` in your Supabase database.

### Step 1: Create Table

Go to your Supabase Dashboard → SQL Editor → New Query, then run:

```sql
-- Create cancer_types table
CREATE TABLE cancer_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  risk_factors TEXT[] NOT NULL,
  prevention_tips TEXT[] NOT NULL,
  screening_methods TEXT[] NOT NULL,
  early_detection_info TEXT NOT NULL,
  statistics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cancer_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to cancer types"
  ON cancer_types
  FOR SELECT
  TO public
  USING (true);
```

### Step 2: Insert Cancer Data

Run this SQL to insert all 10 cancer types with reliable information:

```sql
-- Insert cancer types data
INSERT INTO cancer_types (name, description, icon_name, symptoms, risk_factors, prevention_tips, screening_methods, early_detection_info, statistics) VALUES

-- 1. Breast Cancer
('Breast Cancer', 
'Breast cancer is a disease in which cells in the breast grow out of control. It is one of the most common cancers affecting women worldwide, though men can also develop it. Early detection through screening and self-examination significantly improves survival rates.',
'medical_information',
ARRAY[
  'A lump or mass in the breast or underarm',
  'Changes in breast size, shape, or appearance',
  'Skin dimpling, redness, or puckering',
  'Nipple discharge (other than breast milk)',
  'Nipple inversion or changes in nipple appearance',
  'Persistent breast pain or tenderness'
],
ARRAY[
  'Being female (though men can get it)',
  'Increasing age (most common after 50)',
  'Family history of breast cancer',
  'Inherited genetic mutations (BRCA1, BRCA2)',
  'Early menstruation or late menopause',
  'Dense breast tissue',
  'Obesity and lack of physical activity',
  'Alcohol consumption',
  'Never having been pregnant or first pregnancy after 30'
],
ARRAY[
  'Maintain a healthy weight',
  'Exercise regularly (at least 150 minutes/week)',
  'Limit alcohol consumption',
  'Breastfeed if possible',
  'Avoid hormone replacement therapy',
  'Know your family history',
  'Perform monthly breast self-exams',
  'Get regular mammograms as recommended'
],
ARRAY[
  'Monthly breast self-examination',
  'Clinical breast exam by healthcare provider',
  'Mammogram (yearly for women 40+)',
  'MRI for high-risk individuals',
  'Genetic testing if family history suggests'
],
'Early detection through regular screening and self-examination is crucial. Women should start monthly self-exams at age 20 and begin annual mammograms at 40 (or earlier if high risk). Survival rate is over 90% when detected early.',
'Most common cancer in women worldwide. 1 in 8 women will develop breast cancer in their lifetime. 5-year survival rate: 99% for localized, 86% for regional, 29% for distant stage.'
),

-- 2. Lung Cancer
('Lung Cancer',
'Lung cancer is the leading cause of cancer deaths globally. It occurs when cells in the lungs grow uncontrollably, forming tumors that can interfere with breathing. Smoking is the primary risk factor, but non-smokers can also develop lung cancer from secondhand smoke, radon, or air pollution.',
'medical_information',
ARRAY[
  'Persistent cough that worsens or doesn''t go away',
  'Coughing up blood or rust-colored sputum',
  'Chest pain that worsens with deep breathing',
  'Shortness of breath or wheezing',
  'Hoarseness or voice changes',
  'Unexplained weight loss and fatigue',
  'Recurrent respiratory infections'
],
ARRAY[
  'Smoking cigarettes, cigars, or pipes',
  'Exposure to secondhand smoke',
  'Radon gas exposure',
  'Workplace exposure to asbestos, arsenic',
  'Air pollution',
  'Family history of lung cancer',
  'Previous radiation therapy to chest',
  'HIV infection'
],
ARRAY[
  'Never start smoking or quit immediately',
  'Avoid secondhand smoke',
  'Test your home for radon',
  'Avoid carcinogens at work (use protective equipment)',
  'Eat a diet rich in fruits and vegetables',
  'Exercise regularly to improve lung function'
],
ARRAY[
  'Low-dose CT scan for high-risk individuals',
  'Annual screening for ages 50-80 with smoking history',
  'Chest X-ray (less effective than CT)',
  'Sputum cytology'
],
'Early detection is challenging as symptoms often appear late. High-risk individuals (heavy smokers aged 50-80) should discuss annual low-dose CT screening with their doctor. Quitting smoking at any age significantly reduces risk.',
'Leading cause of cancer death worldwide. 5-year survival rate: 63% for localized, 35% for regional, 7% for distant stage. 80-90% of cases are linked to smoking.'
),

-- 3. Colorectal Cancer
('Colorectal Cancer',
'Colorectal cancer affects the colon or rectum, parts of the large intestine. It typically begins as polyps (abnormal growths) that can become cancerous over time. Regular screening can prevent colorectal cancer by detecting and removing polyps before they turn into cancer.',
'medical_information',
ARRAY[
  'Blood in stool or rectal bleeding',
  'Persistent changes in bowel habits',
  'Diarrhea, constipation, or narrow stools',
  'Feeling that bowel doesn''t empty completely',
  'Abdominal pain, cramping, or bloating',
  'Unexplained weight loss',
  'Weakness and fatigue',
  'Iron-deficiency anemia'
],
ARRAY[
  'Age over 50',
  'Personal or family history of polyps or colorectal cancer',
  'Inflammatory bowel disease (Crohn''s, ulcerative colitis)',
  'Inherited syndromes (Lynch syndrome, FAP)',
  'Diet high in red and processed meats',
  'Obesity and physical inactivity',
  'Smoking and heavy alcohol use',
  'Type 2 diabetes'
],
ARRAY[
  'Get screened starting at age 45',
  'Eat plenty of fruits, vegetables, and whole grains',
  'Limit red meat and avoid processed meats',
  'Maintain healthy weight',
  'Exercise regularly',
  'Don''t smoke and limit alcohol',
  'Get enough calcium and vitamin D'
],
ARRAY[
  'Colonoscopy every 10 years (age 45+)',
  'Stool-based tests (FIT, gFOBT) annually',
  'Stool DNA test (Cologuard) every 3 years',
  'Flexible sigmoidoscopy every 5 years',
  'CT colonography every 5 years'
],
'Screening saves lives by finding polyps before they become cancer. Begin screening at age 45 (earlier if family history). Colonoscopy is gold standard as it can detect and remove polyps. Over 90% survival if caught early.',
'Third most common cancer worldwide. 5-year survival rate: 91% for localized, 72% for regional, 14% for distant stage. Screening can prevent 60% of deaths.'
),

-- 4. Prostate Cancer
('Prostate Cancer',
'Prostate cancer is one of the most common cancers in men, particularly older men. The prostate is a small gland that produces seminal fluid. Most prostate cancers grow slowly and may not cause serious harm, but some can be aggressive and spread quickly.',
'medical_information',
ARRAY[
  'Frequent urination, especially at night',
  'Difficulty starting or stopping urination',
  'Weak or interrupted urine flow',
  'Pain or burning during urination',
  'Blood in urine or semen',
  'Painful ejaculation',
  'Persistent pain in back, hips, or pelvis',
  'Erectile dysfunction'
],
ARRAY[
  'Age (most common after 50)',
  'Family history of prostate cancer',
  'Race (more common in Black men)',
  'Certain inherited gene mutations',
  'Obesity',
  'Diet high in red meat and high-fat dairy'
],
ARRAY[
  'Maintain healthy weight',
  'Choose a healthy diet rich in fruits and vegetables',
  'Exercise regularly',
  'Discuss screening with doctor if high risk',
  'Consider genetic counseling if family history',
  'Manage chronic conditions like diabetes'
],
ARRAY[
  'PSA (Prostate-Specific Antigen) blood test',
  'Digital rectal exam (DRE)',
  'Discuss screening with doctor (ages 50-70)',
  'Start earlier if high risk (age 40-45)',
  'Prostate biopsy if PSA elevated',
  'MRI for detailed imaging'
],
'Screening decisions should be made with your doctor based on age, risk factors, and personal preferences. PSA testing has benefits and limitations. Most prostate cancers grow slowly; watchful waiting may be appropriate for low-risk cases.',
'Most common cancer in men (excluding skin cancer). 5-year survival rate: nearly 100% for localized/regional, 31% for distant stage. 1 in 8 men will be diagnosed in their lifetime.'
),

-- 5. Cervical Cancer
('Cervical Cancer',
'Cervical cancer occurs in the cervix, the lower part of the uterus. It is highly preventable through HPV vaccination and regular screening. Nearly all cervical cancers are caused by persistent infection with high-risk human papillomavirus (HPV).',
'medical_information',
ARRAY[
  'Abnormal vaginal bleeding (between periods, after sex, after menopause)',
  'Unusual vaginal discharge',
  'Pelvic pain or pain during intercourse',
  'Heavier or longer menstrual periods',
  'Bleeding after douching',
  'In advanced stages: leg swelling, back pain, difficulty urinating'
],
ARRAY[
  'HPV infection (especially types 16 and 18)',
  'Smoking',
  'Weakened immune system (HIV, immunosuppressants)',
  'Multiple sexual partners or early sexual activity',
  'Long-term use of birth control pills',
  'Multiple full-term pregnancies',
  'Low socioeconomic status (less access to screening)'
],
ARRAY[
  'Get HPV vaccine (ages 9-26, ideally before sexual activity)',
  'Regular Pap smears and HPV testing',
  'Practice safe sex and limit sexual partners',
  'Don''t smoke',
  'Get treated for HPV if detected'
],
ARRAY[
  'Pap smear (Pap test) every 3 years (ages 21-65)',
  'HPV test alone every 5 years (ages 25-65)',
  'Co-testing (Pap + HPV) every 5 years (ages 30-65)',
  'Colposcopy if abnormal results',
  'Biopsy to confirm diagnosis'
],
'Cervical cancer is one of the most preventable cancers. HPV vaccination before exposure and regular screening with Pap tests can prevent most cases. Early detection through screening leads to over 90% survival rate.',
'Highly preventable with HPV vaccine and screening. 5-year survival rate: 92% for localized, 58% for regional, 18% for distant stage. HPV vaccine prevents 90% of HPV-related cancers.'
),

-- 6. Liver Cancer
('Liver Cancer',
'Liver cancer, also called hepatocellular carcinoma (HCC), occurs when cells in the liver grow abnormally. It is strongly linked to chronic liver diseases like hepatitis B and C, cirrhosis from alcohol abuse, and fatty liver disease. More common in Asia and Africa.',
'medical_information',
ARRAY[
  'Unexplained weight loss',
  'Loss of appetite or feeling full quickly',
  'Upper abdominal pain or discomfort',
  'Abdominal swelling or bloating',
  'Jaundice (yellowing of skin and eyes)',
  'Nausea and vomiting',
  'Extreme fatigue and weakness',
  'White, chalky stools'
],
ARRAY[
  'Chronic hepatitis B or C infection',
  'Cirrhosis (liver scarring)',
  'Heavy alcohol consumption',
  'Non-alcoholic fatty liver disease (NAFLD)',
  'Obesity and diabetes',
  'Exposure to aflatoxins (contaminated grains)',
  'Inherited liver diseases',
  'Smoking'
],
ARRAY[
  'Get vaccinated against hepatitis B',
  'Avoid hepatitis C (don''t share needles, safe sex)',
  'Limit alcohol or avoid it completely',
  'Maintain healthy weight',
  'Treat hepatitis B/C if infected',
  'Control diabetes and manage fatty liver',
  'Avoid exposure to aflatoxins'
],
ARRAY[
  'Ultrasound every 6 months for high-risk individuals',
  'AFP (alpha-fetoprotein) blood test',
  'CT or MRI scan',
  'Liver biopsy to confirm'
],
'High-risk individuals (chronic hepatitis B/C, cirrhosis) should undergo regular screening every 6 months. Hepatitis B vaccination is the most effective prevention strategy. Early detection significantly improves treatment outcomes.',
'More common in Asia and Africa. 5-year survival rate: 36% for localized, 13% for regional, 3% for distant stage. Hepatitis B vaccine can prevent up to 90% of liver cancer cases.'
),

-- 7. Stomach (Gastric) Cancer
('Stomach Cancer',
'Stomach cancer, also known as gastric cancer, develops in the lining of the stomach. It is more common in Asian countries and is strongly linked to Helicobacter pylori (H. pylori) infection, diet, and lifestyle factors. Early symptoms are often vague, making detection challenging.',
'medical_information',
ARRAY[
  'Persistent indigestion or heartburn',
  'Feeling bloated after eating',
  'Loss of appetite',
  'Unexplained weight loss',
  'Nausea and vomiting',
  'Stomach pain or discomfort',
  'Blood in stool (black, tarry stools)',
  'Feeling full after eating small amounts',
  'Difficulty swallowing'
],
ARRAY[
  'H. pylori infection',
  'Diet high in salty, smoked, and pickled foods',
  'Low fruit and vegetable intake',
  'Smoking',
  'Family history of stomach cancer',
  'Chronic gastritis or stomach polyps',
  'Pernicious anemia',
  'Previous stomach surgery',
  'Age over 50'
],
ARRAY[
  'Get tested and treated for H. pylori',
  'Eat plenty of fresh fruits and vegetables',
  'Limit salty, smoked, and processed foods',
  'Don''t smoke',
  'Maintain healthy weight',
  'Get regular medical checkups',
  'Consider endoscopy if high risk'
],
ARRAY[
  'Upper endoscopy (EGD) for high-risk individuals',
  'H. pylori testing and treatment',
  'Barium X-ray',
  'CT scan',
  'Biopsy during endoscopy'
],
'Early symptoms are often vague and similar to common stomach problems. High-risk individuals (H. pylori infection, family history) should discuss screening with their doctor. Treatment for H. pylori can reduce risk.',
'More common in Asia, Eastern Europe, South America. 5-year survival rate: 75% for localized, 35% for regional, 7% for distant stage. H. pylori infection accounts for 60-80% of cases.'
),

-- 8. Skin Cancer
('Skin Cancer',
'Skin cancer is the most common type of cancer. There are three main types: basal cell carcinoma, squamous cell carcinoma (non-melanoma), and melanoma. While non-melanoma skin cancers are highly curable, melanoma can be deadly if not caught early. UV exposure is the primary cause.',
'medical_information',
ARRAY[
  'New mole or growth on the skin',
  'Changes in existing mole (ABCDE rule)',
  'A: Asymmetry (one half unlike the other)',
  'B: Border (irregular, scalloped edges)',
  'C: Color (varied shades of brown, black)',
  'D: Diameter (larger than pencil eraser)',
  'E: Evolving (changing size, shape, color)',
  'Sore that doesn''t heal',
  'Red, scaly patch',
  'Pearly or waxy bump'
],
ARRAY[
  'UV exposure (sun and tanning beds)',
  'Fair skin, light hair, light eyes',
  'History of sunburns, especially in childhood',
  'Many moles or unusual moles',
  'Family history of skin cancer',
  'Weakened immune system',
  'Exposure to certain chemicals',
  'Age (risk increases with age)'
],
ARRAY[
  'Avoid sun exposure between 10 AM - 4 PM',
  'Wear broad-spectrum sunscreen SPF 30+ daily',
  'Reapply sunscreen every 2 hours',
  'Wear protective clothing (long sleeves, hat)',
  'Seek shade whenever possible',
  'NEVER use tanning beds',
  'Check your skin monthly',
  'Get annual skin exams from dermatologist'
],
ARRAY[
  'Monthly skin self-examination',
  'Annual full-body skin exam by dermatologist',
  'Use ABCDE rule to check moles',
  'Photography to track changes',
  'Biopsy of suspicious lesions'
],
'Perform monthly self-exams using ABCDE rule. See a dermatologist annually for full-body skin check, more often if high risk. Melanoma is highly curable if caught early but deadly if it spreads. Sun protection is key.',
'Most common cancer in the US. Melanoma 5-year survival: 99% for localized, 68% for regional, 30% for distant. 1 in 5 Americans will develop skin cancer by age 70. Tanning beds increase melanoma risk by 75%.'
),

-- 9. Leukemia
('Leukemia',
'Leukemia is a blood cancer affecting white blood cells and bone marrow. It occurs when abnormal white blood cells multiply uncontrollably and crowd out healthy blood cells. There are acute (fast-growing) and chronic (slow-growing) types. More common in children and older adults.',
'medical_information',
ARRAY[
  'Frequent infections',
  'Fever or chills',
  'Persistent fatigue and weakness',
  'Unexplained weight loss',
  'Easy bruising or bleeding',
  'Nosebleeds or bleeding gums',
  'Red spots on skin (petechiae)',
  'Swollen lymph nodes',
  'Enlarged liver or spleen',
  'Bone or joint pain',
  'Night sweats'
],
ARRAY[
  'Genetic factors and chromosomal abnormalities',
  'Previous cancer treatment (chemotherapy, radiation)',
  'Exposure to high levels of radiation',
  'Exposure to certain chemicals (benzene)',
  'Smoking',
  'Certain genetic disorders (Down syndrome)',
  'Family history of leukemia',
  'Age (some types more common in children, others in adults)'
],
ARRAY[
  'Avoid exposure to radiation and chemicals',
  'Don''t smoke',
  'Limit exposure to benzene and pesticides',
  'Maintain healthy immune system',
  'Know your family history',
  'Regular medical checkups'
],
ARRAY[
  'Complete blood count (CBC)',
  'Blood smear examination',
  'Bone marrow biopsy',
  'Genetic testing',
  'Imaging tests (X-ray, CT, MRI)',
  'Lumbar puncture (spinal tap)'
],
'There is no standard screening for leukemia. Diagnosis usually occurs when blood tests reveal abnormalities during routine checkups or investigation of symptoms. Treatment varies by type and may include chemotherapy, targeted therapy, or stem cell transplant.',
'Most common cancer in children under 15. Acute lymphoblastic leukemia (ALL) 5-year survival in children: 90%. Chronic lymphocytic leukemia (CLL) 5-year survival: 88%. Acute myeloid leukemia (AML): 30%.'
),

-- 10. Ovarian Cancer
('Ovarian Cancer',
'Ovarian cancer develops in the ovaries, the female reproductive organs that produce eggs. It is often called the "silent killer" because symptoms are subtle and often mistaken for common digestive issues. By the time it is diagnosed, it has often spread beyond the ovaries.',
'medical_information',
ARRAY[
  'Bloating or abdominal swelling',
  'Pelvic or abdominal pain',
  'Feeling full quickly when eating',
  'Difficulty eating or loss of appetite',
  'Changes in bowel habits (constipation)',
  'Frequent or urgent urination',
  'Fatigue',
  'Unexplained weight loss or gain',
  'Back pain',
  'Abnormal vaginal bleeding (rare)'
],
ARRAY[
  'Age (most common after menopause)',
  'Family history of ovarian or breast cancer',
  'Inherited gene mutations (BRCA1, BRCA2)',
  'Never having been pregnant',
  'Endometriosis',
  'Hormone replacement therapy',
  'Obesity',
  'Early menstruation or late menopause'
],
ARRAY[
  'Know your family history',
  'Consider genetic testing if high risk',
  'Use oral contraceptives (reduces risk)',
  'Breastfeed if possible',
  'Maintain healthy weight',
  'Discuss risk-reducing surgery if high risk',
  'Be aware of symptoms and report to doctor'
],
ARRAY[
  'Pelvic exam (not very effective for early detection)',
  'Transvaginal ultrasound',
  'CA-125 blood test (not specific)',
  'Genetic testing for BRCA mutations',
  'Regular checkups and symptom awareness',
  'No standard screening for average-risk women'
],
'There is no reliable screening test for ovarian cancer in average-risk women. High-risk women (BRCA mutations, family history) should discuss surveillance with their doctor. Awareness of subtle symptoms and prompt reporting to doctor is crucial.',
'Fifth leading cause of cancer death in women. 5-year survival rate: 93% for localized, 75% for regional, 31% for distant stage. Only 20% are diagnosed at early stage. BRCA mutations increase lifetime risk to 40-50%.'
);
```

### Step 3: Verify Data

Run this query to check:

```sql
SELECT name, statistics FROM cancer_types ORDER BY name;
```

### Step 4: Enable in Flutter App

The app is now ready to fetch cancer information from Supabase. The cancer_info_screen will automatically load and display this data.

## Notes

- All information is sourced from reliable organizations: WHO, CDC, National Cancer Institute (NCI), Mayo Clinic, American Cancer Society
- Statistics are approximate and based on global data
- Data can be easily updated in Supabase dashboard
- Public read access is enabled so users can view without authentication
