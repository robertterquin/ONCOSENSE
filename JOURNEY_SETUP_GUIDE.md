# Journey Data Tables - Setup Guide

## ✅ Step 1: Create Supabase Tables

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `JOURNEY_TABLES_SETUP.sql` in this project
6. Copy **ALL** the SQL code from that file
7. Paste it into the Supabase SQL Editor
8. Click **Run** (or press Ctrl/Cmd + Enter)

You should see: "Success. No rows returned"

## ✅ Step 2: Verify Tables Were Created

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should now see 3 new tables:
   - `journey_entries`
   - `journey_treatments`
   - `journey_milestones`

## ✅ Step 3: Test the App

1. Run your Flutter app: `flutter run -d chrome`
2. Log in to your account
3. Add a journal entry, treatment, or milestone
4. Check the console logs - you should see:
   - `💾 Saved X entries`
   - `☁️ Entries synced to Supabase`
5. **Close the browser completely** or restart the app
6. Log back in
7. Your data should now persist! 🎉

## 🔍 Verify Data in Supabase

1. Go to **Table Editor** in Supabase
2. Click on `journey_entries` table
3. You should see your entries with your `user_id`
4. Same for `journey_treatments` and `journey_milestones`

## 🎯 How It Works Now

**Before (Old Way):**
- Data stored only in browser's localStorage (SharedPreferences)
- Lost when browser cache cleared or app reinstalled
- Not synced across devices

**After (New Way with Tables):**
- ✅ Data saved to Supabase database tables
- ✅ Persists across browser sessions
- ✅ Accessible from any device (future feature)
- ✅ Backed up on cloud
- ✅ Also cached locally for offline access
- ✅ Auto-syncs on login

## 📊 Data Flow

```
User adds entry → 
  1. Save to Supabase tables (cloud)
  2. Cache to SharedPreferences (local)

User reopens app → 
  1. Load from Supabase tables (fresh data)
  2. Cache locally for offline use
```

## 🐛 Troubleshooting

**Error: "Could not find the table 'public.journey_entries'"**
- You forgot to run the SQL script in Step 1
- Go back and run `JOURNEY_TABLES_SETUP.sql` in Supabase

**Data still not persisting:**
- Check browser console for errors
- Make sure you're logged in (not guest mode)
- Verify tables were created in Supabase Table Editor

**"RLS policy violation" error:**
- The SQL script should have created policies automatically
- If not, run the SQL script again

## ✨ Benefits of Proper Tables

- ✅ Unlimited storage (no 64KB limit)
- ✅ Data persists across sessions
- ✅ Fast indexed queries
- ✅ Can add analytics/reports later
- ✅ Professional database structure
- ✅ Ready for multi-device sync
