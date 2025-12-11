# CancerApp - Copilot Instructions

## Project Overview
Cancer awareness and education mobile app built with Flutter. Targets Android, iOS, Web, Windows, macOS, and Linux platforms. Provides cancer information, prevention guides, community support, and resource directories. Currently at initial scaffold stage with default counter demo template. Uses Dart SDK ^3.9.2.

## App Architecture

### User Flow & Screens
**Initial Launch Sequence:**
1. **Splash Screen** (2-3s) - Pink ribbon logo, gradient background, app version
2. **Onboarding Slides** (4 screens) - Awareness, Prevention, Community Support, Resources with Next/Skip
3. **Welcome Screen** - Get Started / Login options
4. **Authentication** - Register, Login, Forgot Password flows

**Main App (Bottom Navigation - 5 Tabs):**
1. **Home (Dashboard)** - Main hub with daily tips, awareness highlights, quick access navigation
2. **Cancer Info** - Educational directory of cancer types with symptoms, causes, prevention
3. **Prevention** - Lifestyle tips, self-check guides, healthy habit trackers
4. **Q&A Forum** - Community discussion threads with questions, answers, upvoting
5. **Resources** - Hotlines, screening centers, government assistance programs, support groups

**Additional Screens:**
- **Profile** - User preferences, saved content, health reminders, activity tracking (accessible from menu/header)
- **Settings** - Inside Profile (notifications, theme, privacy, terms)
- **Weekly Check-in** (Optional) - Mood tracker, stress level, wellness journal

### Recommended Folder Structure
```
lib/
├── main.dart
├── screens/
│   ├── splash/
│   │   ├── splash_screen.dart
│   ├── onboarding/
│   │   ├── onboarding_screen.dart
│   │   ├── widgets/ (onboarding_page.dart, page_indicator.dart)
│   ├── auth/
│   │   ├── welcome_screen.dart
│   │   ├── register_screen.dart
│   │   ├── login_screen.dart
│   │   ├── forgot_password_screen.dart
│   │   ├── widgets/ (auth_button.dart, input_field.dart)
│   ├── home/
│   │   ├── home_screen.dart
│   │   ├── widgets/ (daily_tip_card.dart, awareness_banner.dart, quick_access_buttons.dart, survivor_story_card.dart)
│   ├── cancer_info/
│   │   ├── cancer_directory_screen.dart
│   │   ├── cancer_detail_screen.dart
│   │   ├── widgets/ (cancer_type_card.dart, symptom_card.dart, risk_factor_list.dart, faq_section.dart)
│   ├── prevention/
│   │   ├── prevention_screen.dart
│   │   ├── self_check_guide_screen.dart
│   │   ├── myth_fact_screen.dart
│   │   ├── widgets/ (lifestyle_tip_card.dart, prevention_checklist.dart, self_check_tutorial.dart)
│   ├── forum/
│   │   ├── forum_screen.dart
│   │   ├── question_detail_screen.dart
│   │   ├── ask_question_screen.dart
│   │   ├── widgets/ (discussion_thread.dart, answer_card.dart, category_chip.dart, upvote_button.dart)
│   ├── resources/
│   │   ├── resources_screen.dart
│   │   ├── screening_centers_screen.dart
│   │   ├── widgets/ (hotline_card.dart, screening_center_card.dart, support_group_card.dart)
│   ├── profile/
│   │   ├── profile_screen.dart
│   │   ├── edit_profile_screen.dart
│   │   ├── settings_screen.dart
│   │   ├── widgets/ (saved_items_list.dart, health_reminder_card.dart, profile_header.dart)
│   └── check_in/
│       ├── weekly_check_in_screen.dart
│       ├── widgets/ (mood_tracker.dart, stress_meter.dart, journal_input.dart)
├── models/
│   ├── cancer_type.dart
│   ├── question.dart
│   ├── answer.dart
│   ├── resource.dart
│   ├── user.dart
│   ├── health_tip.dart
│   ├── check_in.dart
├── services/
│   ├── auth_service.dart (login, register, guest mode)
│   ├── api_service.dart (if backend integration needed)
│   ├── local_storage_service.dart (bookmarks, saved items, onboarding status)
│   ├── notification_service.dart (health reminders, check-in notifications)
├── widgets/ (shared widgets across app)
│   ├── custom_app_bar.dart
│   ├── custom_bottom_nav.dart
│   ├── search_bar.dart
│   ├── bookmark_button.dart
│   ├── loading_indicator.dart
└── utils/
    ├── constants.dart
    ├── theme.dart (pink ribbon theme, gradient backgrounds)
    ├── helpers.dart
    ├── routes.dart (named routes for navigation)
```

## Development Commands
```bash
# Run the app
flutter run

# Run on specific device
flutter run -d windows    # or: chrome, macos, linux, android, ios

# Hot reload: Press 'r' in terminal or save files in IDE
# Hot restart: Press 'R' in terminal

# Run tests
flutter test

# Analyze code for issues
flutter analyze

# Update dependencies
flutter pub get
flutter pub upgrade --major-versions
```

## Key Features by Screen

### 1. Splash Screen
- Pink ribbon logo (no text)
- Soft gradient background (white-pink)
- Optional tagline: "Empowering Awareness. Saving Lives."
- App version display (bottom)
- 2-3 second duration for initial data loading

### 2. Onboarding Screens (4 slides)
- **Screen 1 - Awareness**: Ribbon icon + "Learn about different cancer types and their early signs"
- **Screen 2 - Prevention**: Healthy lifestyle icons + "Understand prevention tips that can reduce risk"
- **Screen 3 - Community Support**: Chat icon + "Ask. Share. Support each other through the Q&A Forum"
- **Screen 4 - Resources**: Hospital/hotline icons + "Find trusted medical and emotional support"
- Next/Skip buttons
- Page indicators (••••)

### 3. Welcome Screen
- Logo and app name
- "Get Started" button
- "Already have an account? Login" link

### 4. Authentication Flow
**Register Page:**
- Fields: Full Name, Email, Password, Confirm Password, Age (optional), Gender (optional)
- Terms & Privacy Policy checkbox
- Register button
- "Already have an account? Login" link
- Optional: Email verification, Continue as Guest (no forum posting)

**Login Page:**
- Fields: Email, Password
- Login button
- Forgot Password link
- Create Account link

**Forgot Password Page:**
- Enter email field
- Reset link sent confirmation
- Return to Login link

### 🏠 6. Home (Dashboard)
- Daily Health Tip Card (rotates daily)
- Awareness Month Banner (dynamic, e.g., Breast Cancer Awareness Month)
- Featured Cancer Awareness (carousel)
- Quick Access Buttons: Cancer Types, Self-Checks, Find Support
- Survivor Story of the Week
- Latest Articles Preview
- Notification Reminders (screening reminders, hydration reminders)

### 📘 7. Cancer Info
- Grid/List of Cancer Types (breast, lung, colon, cervical, prostate, leukemia, etc.)
- For each cancer type:
  - What is it?
  - Symptoms & warning signs
  - Risk factors (genetics, lifestyle, environmental)
  - Early warning signs
  - When to get screened
  - Visual diagrams
  - FAQ section
- Search bar
- Save/Favorite Cancer Topics

### 🛡️ 8. Prevention
- Lifestyle Tips (Diet, Exercise, No Smoking, Hydration, etc.)
- Myth vs Fact section
- Prevention Checklist
- Self-Check Tutorials:
  - Breast self-exam (with step-by-step images)
  - Skin cancer ABCDE
  - Oral check
- Personalized Prevention Reminders:
  - "Time to drink water"
  - "Move for 3 minutes"
  - "Avoid sun exposure 10AM–3PM"

### 💬 9. Q&A Forum
- Ask a Question button
- Discussion threads with answers + replies
- Upvote helpful answers
- Categories:
  - Symptoms
  - Diagnosis
  - Mental Health
  - Lifestyle
  - Family Support
- Anonymous posting
- Search bar
- Trending Questions
- Report button

### 🆘 10. Resources
- Hotlines:
  - DOH
  - Philippine Cancer Society
  - Government Health Lines
- Screening Centers Directory:
  - Hospitals
  - Clinics
  - Locations / Maps
- Financial Support:
  - PhilHealth
  - PCSO medical aid
- Support Groups:
  - Local
  - Online
- Save favorite resources

### 👤 11. Profile
- Profile Picture
- Name, Age, Gender
- Email
- Sections:
  - Edit Profile
  - Saved Articles
  - Saved Questions
  - Saved Resources
  - App Settings:
    - Notifications
    - Theme (light/dark)
    - Language
    - Privacy Settings
  - Log Out

### 🔧 12. Settings Page (inside Profile)
- Notification controls
- App theme
- Privacy & Permissions
- Terms of Service
- About the App
- Delete Account

### 🔄 13. Weekly Check-in (Optional)
- "How are you feeling today?" prompt
- Mood tracker
- Stress level meter
- Journal notes
- Once-a-week wellness check reminder

## Patterns & Conventions
- **State Management**: Currently uses basic `StatefulWidget` with `setState()`. For this app's complexity, consider Provider or Riverpod for:
  - User authentication state (logged in, guest mode)
  - Onboarding completion status
  - Bookmarked/saved items across screens
  - Forum data (questions, answers, votes)
  - Health reminders and weekly check-in tracking
- **Navigation**: Use named routes (`utils/routes.dart`) for main screens. Navigation flow:
  - Splash → Onboarding (first launch) → Welcome → Auth → Main App (Bottom Nav)
  - Bottom Navigation: Home, Cancer Info, Prevention, Q&A Forum, Resources
  - Profile accessible from app bar/drawer
- **Theming**: Uses `ColorScheme.fromSeed()` with Material 3. **Pink ribbon theme**:
  - Soft gradient backgrounds (white-pink)
  - Healthcare-appropriate color scheme (pinks, purples, calming pastels)
  - Consistent use of gradients for branding
- **Widget Style**: Use `const` constructors where possible, pass `super.key` to widget constructors
- **Data Models**: Create models for cancer types, forum posts, resources, health tips, check-ins, user profiles to maintain type safety
- **Local Storage**: Use `shared_preferences` for:
  - Onboarding completion flag
  - Guest mode preference
  - Bookmarks/saved items
  - User preferences (theme, language)
  - Consider `sqflite` or `hive` for offline forum caching and check-in history
- **Guest Mode**: Allow users to browse content without account, but require authentication for forum posting and saving items
- **Linting**: Uses `flutter_lints` package - run `flutter analyze` to check for issues

## Testing
- Widget tests in `test/` directory using `flutter_test` package
- Test file naming: `*_test.dart`
- Use `WidgetTester` for widget interaction tests
- Priority areas for testing:
  - Onboarding flow (skip, next, completion tracking)
  - Authentication flows (register, login, guest mode)
  - Bottom navigation switching
  - Bookmark/save functionality across screens
  - Forum upvoting and thread interaction
  - Self-check guide step-by-step navigation
  - Search functionality in Cancer Info and Forum
  - Weekly check-in mood tracking

## Key Files
- `pubspec.yaml` - Dependencies and app configuration
- `analysis_options.yaml` - Linting rules (extends `flutter_lints/flutter.yaml`)
- `android/app/build.gradle.kts` - Android build config (applicationId: `com.example.cancerapp`)

## Suggested Packages
- `shared_preferences` - Save onboarding status, bookmarks, user preferences
- `provider` or `riverpod` - State management for auth, saved items, forum state
- `sqflite` or `hive` - Local database for offline forum/content caching, check-in history
- `url_launcher` - Open external links (hotlines, resources, maps)
- `flutter_local_notifications` - Health reminders (self-checks, screenings, weekly check-ins)
- `cached_network_image` - Efficient image loading for cancer diagrams/stories
- `intl` - Date formatting for daily tips, awareness months, check-in timestamps
- `smooth_page_indicator` - Onboarding page indicators (••••)
- `flutter_svg` - Pink ribbon logo and icons
- `animations` - Smooth transitions between screens
- `image_picker` - Profile picture upload
- `flutter_markdown` - Rich text for cancer info pages
- Optional: `firebase_auth`, `cloud_firestore` - If building backend for forum/user accounts
- Optional: `geolocator`, `google_maps_flutter` - Screening centers map view

## Platform Notes
- Android: Kotlin-DSL Gradle, targets SDK defined by Flutter, min SDK from Flutter defaults
- iOS: Swift-based runner
- All platforms configured via Flutter's standard project structure
- **Philippine Context**: Consider localization (Tagalog/English), Philippine hotline numbers (DOH, Philippine Cancer Society), and local resource directories
