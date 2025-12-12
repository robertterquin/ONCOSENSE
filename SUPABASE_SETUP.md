# Supabase Configuration Fix

## Fix 401 Unauthorized Error

The 401 error when signing up is caused by Supabase email confirmation settings. Follow these steps:

### Step 1: Disable Email Confirmation (For Development)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **OncoSense**
3. Navigate to **Authentication** → **Settings**
4. Scroll down to **Email Auth**
5. **Disable** "Enable email confirmations"
6. Click **Save**

### Step 2: Update Site URL (Important)

1. In the same **Authentication** → **Settings** page
2. Find **Site URL** field
3. Set it to: `http://localhost:3000` (or your app's URL)
4. Click **Save**

### Step 3: Configure Redirect URLs

1. Still in **Authentication** → **Settings**
2. Find **Redirect URLs** section
3. Add these URLs:
   - `http://localhost:3000/**`
   - `http://localhost:8080/**`
   - Your production URL when deploying
4. Click **Save**

### Alternative: Enable Email Confirmation Properly

If you want to keep email confirmation enabled:

1. In **Authentication** → **Email Templates**
2. Configure the **Confirmation** email template
3. Make sure your **Site URL** is set correctly
4. Users will receive a confirmation email after signup
5. They must click the link before they can login

## Testing After Configuration

1. Clear your browser cache or use incognito mode
2. Run your app: `flutter run -d chrome` or `flutter run -d windows`
3. Try registering a new account
4. You should now be able to register without 401 errors

## Current Configuration

Your app is now configured with:
- **Auth Flow**: `implicit` (better for web/desktop apps)
- **Debug Mode**: Enabled (shows detailed auth logs in console)
- **Error Handling**: Improved error messages

## Verify Your Supabase Keys

Double-check your [.env](.env) file contains correct keys:
```
SUPABASE_URL=https://gvjkgoomwzdtegzzhwfy.supabase.co
SUPABASE_ANON_KEY=eyJhbG...your-actual-key
```

You can find your keys at:
**Project Settings** → **API** in your Supabase dashboard

## Common Issues

### Still Getting 401 Error?
- Verify email confirmation is disabled
- Check that your anon key is correct
- Ensure you saved changes in Supabase dashboard
- Clear browser cache and try again

### Email Not Sending?
- Configure SMTP settings in **Authentication** → **Settings** → **SMTP Settings**
- Or use Supabase's built-in email service (free tier included)

### Can't Login After Signup?
- If email confirmation is enabled, check user's email inbox
- Verify the confirmation email was sent
- Check spam folder

## Need Help?

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Supabase Community: https://github.com/supabase/supabase/discussions
