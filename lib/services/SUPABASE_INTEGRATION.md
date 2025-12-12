# Supabase Integration Guide

## Overview
Your OncoSense app is now fully integrated with Supabase for authentication and backend services.

## Authentication Features

### ✅ Implemented Features

1. **User Registration** - [register_screen.dart](../screens/auth/register_screen.dart)
   - Email/password signup with Supabase
   - User metadata stored (full name, age, gender)
   - Email verification sent automatically
   - Proper error handling for duplicate emails, weak passwords, etc.

2. **User Login** - [login_screen.dart](../screens/auth/login_screen.dart)
   - Email/password authentication
   - Remember me checkbox (UI only, can add persistence)
   - Guest mode option (no authentication required)
   - Proper error handling

3. **Password Reset** - [forgot_password_screen.dart](../screens/auth/forgot_password_screen.dart)
   - Send password reset email via Supabase
   - Success/error handling
   - Email validation

4. **Supabase Service** - [supabase_service.dart](../services/supabase_service.dart)
   - Singleton pattern for easy access
   - Pre-built auth methods
   - Auth state monitoring
   - Direct client access for database operations

## How to Use

### Check if User is Logged In
```dart
import 'package:cancerapp/services/supabase_service.dart';

final supabase = SupabaseService();

if (supabase.isAuthenticated) {
  // User is logged in
  final user = supabase.currentUser;
  print('User email: ${user?.email}');
  print('User name: ${user?.userMetadata?['full_name']}');
}
```

### Get Current User Information
```dart
final supabase = SupabaseService();
final user = supabase.currentUser;

if (user != null) {
  String email = user.email ?? '';
  String? name = user.userMetadata?['full_name'];
  int? age = user.userMetadata?['age'];
  String? gender = user.userMetadata?['gender'];
}
```

### Sign Out User
```dart
final supabase = SupabaseService();
await supabase.signOut();
Navigator.pushReplacementNamed(context, '/login');
```

### Listen to Auth State Changes
```dart
final supabase = SupabaseService();

supabase.authStateChanges.listen((authState) {
  final session = authState.session;
  if (session != null) {
    // User signed in
    print('User logged in: ${session.user.email}');
  } else {
    // User signed out
    print('User logged out');
  }
});
```

### Database Operations
```dart
final supabase = SupabaseService();

// Insert data
await supabase.client
  .from('your_table')
  .insert({'column': 'value'});

// Query data
final response = await supabase.client
  .from('your_table')
  .select()
  .eq('id', userId);

// Update data
await supabase.client
  .from('your_table')
  .update({'column': 'new_value'})
  .eq('id', recordId);

// Delete data
await supabase.client
  .from('your_table')
  .delete()
  .eq('id', recordId);
```

### Protect Routes with AuthGuard
```dart
import 'package:cancerapp/widgets/auth_state_listener.dart';

// Use in your route
home: (context) => AuthGuard(
  child: HomeScreen(),
  loginRoute: '/login',
),
```

## Supabase Dashboard Setup

### Enable Email Authentication
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **OncoSense**
3. Navigate to **Authentication** > **Providers**
4. Ensure **Email** provider is enabled

### Configure Email Templates (Optional)
1. Go to **Authentication** > **Email Templates**
2. Customize:
   - Confirmation email (sent after registration)
   - Magic link email
   - Password reset email
   - Email change confirmation

### Set up Database Tables
Create tables for your app data:

```sql
-- Example: User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## Error Handling

All authentication methods handle errors properly:

```dart
try {
  await supabase.signIn(email: email, password: password);
} on AuthException catch (e) {
  // Handle Supabase-specific errors
  // e.message contains user-friendly error message
  print('Auth error: ${e.message}');
} catch (e) {
  // Handle other errors
  print('Error: $e');
}
```

## Environment Variables

Your Supabase credentials are stored in [.env](../.env):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

**⚠️ Security Note:** The `.env` file is added to `.gitignore` to prevent committing sensitive credentials.

## Next Steps

1. **Create Database Tables** - Set up tables for:
   - Cancer information
   - Forum posts and comments
   - Resources
   - User bookmarks
   - Health check-ins

2. **Implement Data Models** - Create Dart models in `lib/models/` for:
   - User profiles
   - Cancer types
   - Forum posts
   - Resources

3. **Add Real-time Features** - Use Supabase real-time:
   ```dart
   supabase.client
     .from('forum_posts')
     .stream(primaryKey: ['id'])
     .listen((data) {
       // Handle real-time updates
     });
   ```

4. **File Storage** - For images (profile pictures, cancer diagrams):
   ```dart
   await supabase.client.storage
     .from('avatars')
     .upload('user_${user.id}.jpg', file);
   ```

5. **Profile Screen Integration** - Update profile screen to:
   - Display user metadata
   - Allow users to update their profile
   - Show saved/bookmarked content

## Testing

Test your authentication:

1. Run the app: `flutter run`
2. Navigate to Register screen
3. Create a test account
4. Check your email for verification link
5. Login with your credentials
6. Test password reset flow

## Support

- Supabase Documentation: https://supabase.com/docs
- Flutter Supabase Guide: https://supabase.com/docs/guides/getting-started/tutorials/with-flutter
