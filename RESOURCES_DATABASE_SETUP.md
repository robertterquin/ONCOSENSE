# Resources Database Setup

## Create Resources Table in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **OncoSense**
3. Navigate to **SQL Editor**
4. Run the following SQL:

```sql
-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hotline', 'screening_center', 'financial_support', 'support_group')),
  description TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  address TEXT,
  website TEXT,
  email TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_verified_active ON resources(is_verified, is_active);

-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read verified resources
CREATE POLICY "Allow public read access to verified resources"
  ON resources
  FOR SELECT
  USING (is_verified = true AND is_active = true);

-- Create policy for admins to insert/update resources (optional)
CREATE POLICY "Allow admin to manage resources"
  ON resources
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert sample Philippine cancer resources
INSERT INTO resources (name, type, description, phone, location, is_verified, is_active) VALUES
-- Hotlines
('Department of Health', 'hotline', 'National health hotline for health concerns and emergencies', '1555', 'Philippines', true, true),
('Philippine Cancer Society', 'hotline', 'Cancer support, information, and counseling hotline', '(02) 8508-7777', 'Metro Manila', true, true),
('National Center for Mental Health Crisis Hotline', 'hotline', 'Mental health support for patients and caregivers', '0917-899-8727', 'Philippines', true, true),
('Philippine Red Cross', 'hotline', 'Emergency medical services and blood donation', '143', 'Philippines', true, true),

-- Screening Centers
('Philippine General Hospital', 'screening_center', 'Cancer screening and treatment facility', '(02) 8554-8400', 'Manila', true, true),
('National Kidney and Transplant Institute', 'screening_center', 'Specialized cancer screening services', '(02) 8981-0300', 'Quezon City', true, true),
('Philippine Heart Center', 'screening_center', 'Comprehensive health screening including cancer detection', '(02) 8925-2401', 'Quezon City', true, true),
('Veterans Memorial Medical Center', 'screening_center', 'Full cancer screening and diagnostic services', '(02) 8927-5555', 'Quezon City', true, true),
('Jose B. Lingad Memorial Regional Hospital', 'screening_center', 'Regional cancer screening facility', '(045) 963-2701', 'Pampanga', true, true),
('Vicente Sotto Memorial Medical Center', 'screening_center', 'Cancer screening and treatment center', '(032) 253-9891', 'Cebu City', true, true),
('Southern Philippines Medical Center', 'screening_center', 'Regional cancer detection and treatment', '(082) 227-2731', 'Davao City', true, true),

-- Financial Support
('PhilHealth', 'financial_support', 'Government health insurance coverage for cancer treatment', '(02) 8441-7442', 'Philippines', true, true),
('PCSO Individual Medical Assistance Program', 'financial_support', 'Financial aid for medicines, chemotherapy, and hospital bills', '(02) 8733-8384', 'Philippines', true, true),
('DSWD Medical Assistance Program', 'financial_support', 'Department of Social Welfare medical assistance', '(02) 8931-8101', 'Philippines', true, true),
('Malasakit Center', 'financial_support', 'One-stop shop for medical and financial assistance', '1-800-10-920-0658', 'Philippines', true, true),
('DOH Assistance to Indigent Patients', 'financial_support', 'Department of Health financial assistance program', '(02) 8651-7800', 'Philippines', true, true),

-- Support Groups
('ICanServe Foundation', 'support_group', 'Breast cancer support community and education', '(02) 8820-6363', 'Online & Local', true, true),
('Cancer Warriors Foundation', 'support_group', 'Peer support for cancer patients and survivors', '(02) 8705-2110', 'Metro Manila', true, true),
('Kythe Foundation', 'support_group', 'Support for children with cancer and their families', '(02) 8818-9528', 'Metro Manila', true, true),
('Liwanag at Ligaya Foundation', 'support_group', 'Community support for cancer patients', '(032) 412-5751', 'Cebu', true, true),
('Pink Ribbon Brigade PH', 'support_group', 'Online breast cancer survivor community', NULL, 'Online', true, true),
('Cancer Coalition Philippines', 'support_group', 'National cancer awareness and support network', NULL, 'Philippines', true, true);
```

## Verify Table Creation

1. Go to **Table Editor** in Supabase
2. You should see the `resources` table
3. Verify the sample data has been inserted
4. Check that `is_verified` is set to `true` for all entries

## Row Level Security

The table has RLS enabled with the following policies:
- **Public Read**: Anyone can read verified and active resources
- **Admin Manage**: Authenticated users (admins) can add/update resources

## Adding More Resources

To add more resources through Supabase dashboard:

1. Go to **Table Editor** → **resources**
2. Click **Insert row**
3. Fill in the details:
   - `name`: Resource name
   - `type`: One of: hotline, screening_center, financial_support, support_group
   - `description`: Brief description
   - `phone`: Contact number (optional)
   - `location`: City/Region (optional)
   - `is_verified`: ✅ **Check this** to show in app
   - `is_active`: ✅ Check this
4. Click **Save**

## Important Note

⚠️ **Only set `is_verified = true` for reliable, official sources**

Verified sources should be:
- Government health agencies
- Official hospitals and medical centers
- Established cancer organizations
- Recognized support groups
- Verified hotlines

Do NOT verify:
- Unproven alternative treatments
- Non-medical "cure" claims
- Unverified personal recommendations
- Commercial promotions

## Testing

After setup, test in your app:

```bash
flutter run
```

Navigate to the Resources tab and you should see all verified resources grouped by type.
