# Prevention Database Setup for Supabase

## Overview
This document provides the complete database schema for storing reliable prevention tips and self-check guides with proper source attribution. All content should be from trusted medical sources (WHO, CDC, NCI, Mayo Clinic, etc.).

## Database Tables

### 1. Prevention Tips Table

```sql
-- Create prevention_tips table
CREATE TABLE prevention_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name TEXT NOT NULL, -- Material icon name (e.g., 'restaurant_outlined', 'directions_run_outlined')
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Diet', 'Exercise', 'Lifestyle', 'Screening', etc.
  detailed_info TEXT, -- Extended information with more details
  source_name TEXT NOT NULL, -- e.g., 'World Health Organization (WHO)', 'CDC', 'Mayo Clinic'
  source_url TEXT NOT NULL, -- Link to the original source
  date_verified TIMESTAMP DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_prevention_tips_category ON prevention_tips(category);
CREATE INDEX idx_prevention_tips_active ON prevention_tips(is_active);

-- Enable Row Level Security
ALTER TABLE prevention_tips ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active prevention tips
CREATE POLICY "Anyone can view active prevention tips"
ON prevention_tips FOR SELECT
USING (is_active = true);

-- Insert reliable prevention tips data
INSERT INTO prevention_tips (icon_name, title, description, category, detailed_info, source_name, source_url, display_order) VALUES
-- Diet and Nutrition
('restaurant_outlined', 'Healthy Diet', 'Eat more fruits, vegetables, and whole grains', 'Diet', 
'A diet rich in fruits, vegetables, whole grains, and lean proteins can help reduce cancer risk. Aim for at least 5 servings of fruits and vegetables daily. Limit processed foods, red meat, and foods high in salt and sugar.',
'World Health Organization (WHO)', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', 1),

('apple', 'Plant-Based Foods', 'Include more plant-based foods in your diet', 'Diet',
'Plant-based foods are rich in antioxidants, fiber, and phytochemicals that may help protect against cancer. Include colorful vegetables, legumes, nuts, and seeds in your meals.',
'American Institute for Cancer Research', 'https://www.aicr.org/cancer-prevention/', 2),

-- Exercise
('directions_run_outlined', 'Regular Exercise', 'Aim for 150 minutes of moderate activity weekly', 'Exercise',
'Regular physical activity helps maintain a healthy weight and reduces the risk of several types of cancer including breast, colon, and endometrial cancer. Aim for at least 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity activity per week.',
'Centers for Disease Control (CDC)', 'https://www.cdc.gov/cancer/dcpc/prevention/index.htm', 3),

('fitness_center', 'Stay Active', 'Reduce sedentary time throughout the day', 'Exercise',
'Even if you exercise regularly, prolonged sitting increases cancer risk. Break up long periods of sitting by standing, stretching, or walking for a few minutes every hour.',
'American Cancer Society', 'https://www.cancer.org/healthy/eat-healthy-get-active.html', 4),

-- Lifestyle
('smoke_free_outlined', 'No Smoking', 'Avoid tobacco and secondhand smoke exposure', 'Lifestyle',
'Tobacco use is the single largest preventable cause of cancer worldwide. It causes about 15 different types of cancer including lung, throat, mouth, pancreas, and bladder cancer. Avoid all tobacco products and secondhand smoke.',
'National Cancer Institute (NCI)', 'https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco', 5),

('local_drink_outlined', 'Limit Alcohol', 'Reduce alcohol consumption for better health', 'Lifestyle',
'Alcohol increases the risk of several types of cancer including breast, liver, mouth, throat, and colon cancer. If you drink alcohol, do so in moderation: up to one drink per day for women and two drinks per day for men.',
'World Health Organization (WHO)', 'https://www.who.int/news-room/fact-sheets/detail/alcohol', 6),

('wb_sunny_outlined', 'Sun Protection', 'Protect your skin from harmful UV rays', 'Lifestyle',
'Use broad-spectrum sunscreen with SPF 30 or higher, wear protective clothing, seek shade during peak sun hours (10 AM - 4 PM), and avoid tanning beds. Skin cancer is one of the most common but also most preventable cancers.',
'Skin Cancer Foundation', 'https://www.skincancer.org/skin-cancer-prevention/', 7),

('bedtime', 'Quality Sleep', 'Get 7-9 hours of quality sleep each night', 'Lifestyle',
'Adequate sleep supports immune function and helps regulate hormones. Poor sleep and shift work have been linked to increased cancer risk. Maintain a regular sleep schedule and create a restful sleep environment.',
'Mayo Clinic', 'https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/sleep/art-20048379', 8),

-- Weight Management
('monitor_weight_outlined', 'Healthy Weight', 'Maintain a healthy body weight', 'Weight',
'Being overweight or obese is linked to 13 types of cancer. Maintain a healthy weight through balanced diet and regular exercise. Aim for a BMI between 18.5 and 24.9.',
'American Cancer Society', 'https://www.cancer.org/healthy/eat-healthy-get-active/take-action/cancer-risk-and-weight.html', 9),

-- Screening
('medical_services_outlined', 'Regular Screenings', 'Get age-appropriate cancer screenings', 'Screening',
'Regular cancer screenings can detect cancer early when it is most treatable. Follow recommended screening guidelines for breast, cervical, colorectal, and other cancers based on your age, gender, and risk factors.',
'Centers for Disease Control (CDC)', 'https://www.cdc.gov/cancer/dcpc/prevention/screening.htm', 10),

-- Vaccination
('vaccines_outlined', 'Get Vaccinated', 'HPV and Hepatitis B vaccines prevent cancer', 'Prevention',
'HPV vaccine prevents cervical, anal, and throat cancers. Hepatitis B vaccine prevents liver cancer. These vaccines are safe and effective for cancer prevention.',
'World Health Organization (WHO)', 'https://www.who.int/news-room/fact-sheets/detail/cancer', 11),

-- Hydration
('water_drop_outlined', 'Stay Hydrated', 'Drink 8 glasses of water daily', 'Hydration',
'Proper hydration supports overall health and may help reduce the risk of bladder cancer by flushing out toxins. Aim for 8-10 glasses (2-2.5 liters) of water per day.',
'Mayo Clinic', 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256', 12);
```

### 2. Self-Check Guides Table

```sql
-- Create self_check_guides table
CREATE TABLE self_check_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cancer_type TEXT NOT NULL, -- 'Breast', 'Skin', 'Oral', 'Testicular', etc.
  frequency TEXT NOT NULL, -- 'Monthly', 'Weekly', 'As needed', etc.
  age_recommendation TEXT, -- 'Women 20+', 'Adults 18+', etc.
  steps JSONB NOT NULL, -- Array of step-by-step instructions
  warning_signs JSONB, -- Array of warning signs to look for
  when_to_see_doctor TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  date_verified TIMESTAMP DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_self_check_guides_cancer_type ON self_check_guides(cancer_type);
CREATE INDEX idx_self_check_guides_active ON self_check_guides(is_active);

-- Enable Row Level Security
ALTER TABLE self_check_guides ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active self-check guides
CREATE POLICY "Anyone can view active self-check guides"
ON self_check_guides FOR SELECT
USING (is_active = true);

-- Insert self-check guides data
INSERT INTO self_check_guides (title, description, cancer_type, frequency, age_recommendation, steps, warning_signs, when_to_see_doctor, source_name, source_url, display_order) VALUES

-- Breast Self-Exam
('Breast Self-Exam', 'Step-by-step guide for monthly checks', 'Breast', 'Monthly', 'Women 20+',
'[
  {"step": 1, "instruction": "In the shower: Use the pads of your fingers to check your entire breast using circular motions", "detail": "Move from the outside to the center, checking the entire breast and armpit area. Use light, medium, and firm pressure."},
  {"step": 2, "instruction": "In front of a mirror: Look at your breasts with arms at sides, then raised overhead", "detail": "Look for changes in contour, swelling, dimpling of skin, or changes in nipples."},
  {"step": 3, "instruction": "Look with hands on hips: Press firmly to flex chest muscles", "detail": "Look for any changes or dimpling. Left and right breast will not match exactly—few women's breasts do."},
  {"step": 4, "instruction": "Lying down: Place a pillow under right shoulder and right arm behind head", "detail": "Using left hand, check right breast using circular, finger pad motions. Cover entire breast and armpit area."},
  {"step": 5, "instruction": "Repeat step 4 for the left breast", "detail": "Switch pillow to left shoulder, left arm behind head, and use right hand to check left breast."}
]',
'[
  "New lump or mass (may be painless or tender)",
  "Change in breast size or shape",
  "Dimpling or puckering of breast skin",
  "Nipple discharge (especially bloody or clear)",
  "Nipple retraction (turning inward)",
  "Skin redness, scaliness, or thickening",
  "Pain in the breast or nipple area"
]',
'See a doctor immediately if you notice any new lumps, changes in breast size or shape, skin changes, nipple discharge, or persistent pain. Do not wait for your next scheduled appointment.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/breast-self-exam.html', 1),

-- Skin Cancer ABCDE
('Skin Cancer ABCDE Check', 'How to identify suspicious moles', 'Skin', 'Monthly', 'Adults 18+',
'[
  {"step": 1, "instruction": "A - Asymmetry: Check if one half of the mole doesn''t match the other half", "detail": "Draw an imaginary line through the center. If the two halves don''t match, it could be concerning."},
  {"step": 2, "instruction": "B - Border: Look for irregular, scalloped, or poorly defined borders", "detail": "Benign moles typically have smooth, even borders. Melanoma often has uneven or notched edges."},
  {"step": 3, "instruction": "C - Color: Check for varied colors or uneven distribution of color", "detail": "Warning signs include multiple colors, shades of tan, brown, black, white, red, or blue within the same mole."},
  {"step": 4, "instruction": "D - Diameter: Measure if the mole is larger than 6mm (pencil eraser size)", "detail": "Melanomas are usually larger than 6mm when diagnosed, but they can be smaller. Any change in size is important."},
  {"step": 5, "instruction": "E - Evolving: Monitor any mole that is changing in size, shape, color, or symptoms", "detail": "Be alert to changes such as bleeding, itching, crusting, or elevation. Take photos to track changes over time."}
]',
'[
  "Asymmetrical mole",
  "Irregular or blurred borders",
  "Multiple colors in one mole",
  "Diameter larger than 6mm",
  "Changing size, shape, or color",
  "Itching, bleeding, or crusting",
  "New mole appearing after age 30",
  "Mole that looks different from others (ugly duckling sign)"
]',
'Consult a dermatologist if you notice any ABCDE warning signs, new moles after age 30, or changes in existing moles. Early detection of melanoma significantly improves survival rates.',
'Skin Cancer Foundation', 'https://www.skincancer.org/skin-cancer-information/melanoma/melanoma-warning-signs-and-images/do-you-know-your-abcdes/', 2),

-- Oral Cancer Check
('Oral Cancer Self-Check', 'Self-examination techniques for mouth', 'Oral', 'Monthly', 'Adults 18+',
'[
  {"step": 1, "instruction": "Remove dentures if you wear them", "detail": "It''s important to check the entire mouth without any obstructions."},
  {"step": 2, "instruction": "Look at your face and neck: Check for asymmetry, lumps, or bumps", "detail": "Stand in front of a mirror in good lighting. Look at both sides of your face and feel your neck and jaw area."},
  {"step": 3, "instruction": "Examine lips and gums: Pull out lips to check inner surfaces", "detail": "Look for color changes, sores, or bumps on both lips (upper and lower) and gum line."},
  {"step": 4, "instruction": "Check inside cheeks: Gently pull cheeks out to see inside surfaces", "detail": "Look for white, red, or dark patches. Check both left and right cheeks thoroughly."},
  {"step": 5, "instruction": "Examine the roof of your mouth: Tilt head back and open wide", "detail": "Use a flashlight to see the hard and soft palate. Look for color changes or unusual texture."},
  {"step": 6, "instruction": "Check your tongue: Stick out tongue and examine all surfaces", "detail": "Look at top, bottom, and sides. Pull tongue to left and right to check edges. Look for lumps, color changes, or sores."},
  {"step": 7, "instruction": "Feel for lumps: Use your finger to feel the floor of mouth and tongue", "detail": "Gently press to feel for any hard lumps or masses that weren''t there before."}
]',
'[
  "Sore or ulcer that doesn''t heal within 2 weeks",
  "White, red, or dark patches in mouth",
  "Lump or thickening in cheek or tongue",
  "Difficulty swallowing or chewing",
  "Numbness or loss of feeling in mouth",
  "Persistent sore throat or hoarseness",
  "Difficulty moving jaw or tongue",
  "Unexplained bleeding in mouth",
  "Loose teeth without obvious cause"
]',
'See a dentist or doctor if you have any sore, lump, or color change that persists for more than 2 weeks, difficulty swallowing, or persistent hoarseness. Early detection is crucial for successful treatment.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/oral-cavity-and-oropharyngeal-cancer/detection-diagnosis-staging.html', 3),

-- Testicular Self-Exam
('Testicular Self-Exam', 'Monthly self-check for testicular cancer', 'Testicular', 'Monthly', 'Men 15-40',
'[
  {"step": 1, "instruction": "Perform exam after a warm shower when scrotal skin is relaxed", "detail": "The warmth relaxes the scrotum, making it easier to feel anything unusual."},
  {"step": 2, "instruction": "Stand in front of a mirror and look for swelling on scrotal skin", "detail": "Check for any visible changes, swelling, or differences between the two sides."},
  {"step": 3, "instruction": "Examine each testicle with both hands", "detail": "Place index and middle fingers under the testicle with thumbs on top. Roll the testicle gently between thumbs and fingers."},
  {"step": 4, "instruction": "Feel for lumps, changes in size, or irregular texture", "detail": "The testicle should feel smooth and firm but not hard. It''s normal for one testicle to be slightly larger or hang lower."},
  {"step": 5, "instruction": "Find the epididymis: Soft, tube-like structure behind testicle", "detail": "This is normal anatomy. It should feel soft and slightly tender to touch. Don''t mistake this for a lump."}
]',
'[
  "Painless lump or swelling in testicle",
  "Change in testicle size or shape",
  "Feeling of heaviness in scrotum",
  "Dull ache in lower abdomen or groin",
  "Sudden fluid collection in scrotum",
  "Pain or discomfort in testicle or scrotum",
  "Enlargement or tenderness of breasts (rare)"
]',
'Contact a doctor immediately if you find any lump, swelling, or change in your testicles. Most lumps are not cancer, but only a doctor can make a proper diagnosis. Testicular cancer is highly treatable when caught early.',
'American Cancer Society', 'https://www.cancer.org/cancer/types/testicular-cancer/detection-diagnosis-staging/detection.html', 4);
```

## Usage Notes

### For App Developers

1. **Fetching Prevention Tips**: Query `prevention_tips` table ordered by `display_order`
2. **Fetching Self-Check Guides**: Query `self_check_guides` table ordered by `display_order`
3. **Filtering**: Use `category` or `cancer_type` to filter content
4. **Source Display**: Always display `source_name` and link to `source_url` for credibility
5. **Updates**: Use `date_verified` to track when information was last verified

### Content Management

- **Adding New Tips**: Insert new rows with proper source attribution
- **Updating Content**: Update existing rows and change `updated_at` timestamp
- **Deactivating**: Set `is_active = false` instead of deleting (preserves data)
- **Reordering**: Modify `display_order` values to change presentation order

## Verification Schedule

Medical information should be reviewed and verified periodically:
- **Prevention Tips**: Review every 6 months
- **Self-Check Guides**: Review annually or when guidelines change
- **Sources**: Ensure all source URLs are still valid and point to current information

## Reliable Sources Reference

### Primary Sources (Highest Authority)
- **World Health Organization (WHO)**: https://www.who.int/health-topics/cancer
- **National Cancer Institute (NCI)**: https://www.cancer.gov
- **Centers for Disease Control (CDC)**: https://www.cdc.gov/cancer
- **American Cancer Society**: https://www.cancer.org

### Specialty Organizations
- **American Institute for Cancer Research**: https://www.aicr.org
- **Skin Cancer Foundation**: https://www.skincancer.org
- **Mayo Clinic**: https://www.mayoclinic.org

### Philippine Sources
- **Department of Health (DOH) Philippines**: https://doh.gov.ph
- **Philippine Cancer Society**: https://www.philcancer.org.ph

## Testing Your Setup

After running the SQL scripts:

```sql
-- Test query for prevention tips
SELECT id, title, category, source_name 
FROM prevention_tips 
WHERE is_active = true 
ORDER BY display_order;

-- Test query for self-check guides
SELECT id, title, cancer_type, frequency 
FROM self_check_guides 
WHERE is_active = true 
ORDER BY display_order;
```

You should see all the inserted data with proper source attribution.
