# Health Reminders Database Setup

## Supabase Table for Health Reminders

Execute this SQL in your Supabase SQL Editor:

```sql
-- Create health_reminders table
CREATE TABLE health_reminders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL,
  frequency_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE,
  last_shown_at TIMESTAMPTZ,
  source TEXT,
  priority INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_health_reminders_category ON health_reminders(category);
CREATE INDEX idx_health_reminders_is_active ON health_reminders(is_active);
CREATE INDEX idx_health_reminders_priority ON health_reminders(priority DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE health_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_reminders
-- Everyone can view health reminders
CREATE POLICY "Health reminders are viewable by everyone" ON health_reminders
  FOR SELECT USING (true);

-- Only authenticated users can insert (for seeding)
CREATE POLICY "Authenticated users can insert health reminders" ON health_reminders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update health reminders" ON health_reminders
  FOR UPDATE USING (auth.role() = 'authenticated');
```

## Categories

The following categories are available:
- `hydration` - Water intake reminders
- `exercise` - Physical activity reminders
- `nutrition` - Healthy eating reminders
- `screening` - Cancer screening reminders
- `mental_health` - Mental wellness reminders
- `sun_protection` - Skin cancer prevention
- `sleep_health` - Sleep quality reminders
- `self_exam` - Self-examination reminders

## Reliable Sources

All health information is sourced from:
- **WHO** - World Health Organization
- **CDC** - Centers for Disease Control and Prevention
- **American Cancer Society**
- **National Cancer Institute**
- **National Institute of Mental Health**
- **Skin Cancer Foundation**
- **National Sleep Foundation**

## Setup Instructions

### Step 1: Create the Table
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the SQL above
4. Click **Run**
5. Wait for success message

### Step 2: Seed with Reliable Data
Run this in your Flutter app (one time):

```dart
import 'package:cancerapp/services/health_reminders_service.dart';

// In your initialization code or a setup screen
final healthService = HealthRemindersService();
await healthService.seedHealthReminders();
```

Or create a separate SQL query to insert the data directly.

### Step 3: Verify
1. Go to Table Editor in Supabase
2. Check `health_reminders` table
3. You should see multiple health reminders with trusted sources

## Usage in Your App

```dart
// Get active reminders
final reminders = await healthService.getActiveReminders();

// Get reminders to show now
final todayReminders = await healthService.getRemindersToShow(count: 2);

// Get reminders by category
final exerciseReminders = await healthService.getRemindersByCategory('exercise');

// Mark reminder as shown
await healthService.markReminderAsShown(reminderId);
```

## Features

✅ Reliable health information from trusted sources
✅ Frequency-based display (hourly, daily, weekly, monthly)
✅ Priority system for important reminders
✅ Category-based filtering
✅ Source attribution for transparency
✅ Last shown tracking to avoid repetition
✅ Easy to update and maintain

## Future Enhancements

- [ ] User-specific reminder preferences
- [ ] Push notifications for critical reminders
- [ ] Reminder completion tracking
- [ ] Personalized reminder scheduling
- [ ] Multi-language support
