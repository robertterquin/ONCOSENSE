class AppConstants {
  // App Info
  static const String appName = 'OncoSense';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Empowering Awareness. Saving Lives.';
  
  // Validation
  static const int minPasswordLength = 6;
  static const int minNameLength = 2;
  static const int minAge = 13;
  static const int maxAge = 120;
  
  // Email Regex Pattern
  static final RegExp emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );
  
  // Error Messages
  static const String emailEmptyError = 'Please enter your email';
  static const String emailInvalidError = 'Please enter a valid email';
  static const String passwordEmptyError = 'Please enter your password';
  static const String passwordShortError = 'Password must be at least $minPasswordLength characters';
  static const String passwordMismatchError = 'Passwords do not match';
  static const String nameEmptyError = 'Please enter your name';
  static const String nameShortError = 'Name must be at least $minNameLength characters';
  static const String termsNotAcceptedError = 'Please accept the terms and conditions';
  
  // Success Messages
  static const String registrationSuccess = 'Account created successfully!';
  static const String loginSuccess = 'Welcome back!';
  static const String passwordResetEmailSent = 'Password reset link sent to your email';
  
  // Gender Options
  static const List<String> genderOptions = [
    'Male',
    'Female',
    'Non-binary',
    'Prefer not to say',
  ];
  
  // Spacing
  static const double smallSpacing = 8.0;
  static const double mediumSpacing = 16.0;
  static const double largeSpacing = 24.0;
  static const double extraLargeSpacing = 32.0;
  
  // Border Radius
  static const double smallRadius = 8.0;
  static const double mediumRadius = 12.0;
  static const double largeRadius = 16.0;
  
  // Animation Durations
  static const Duration shortDuration = Duration(milliseconds: 200);
  static const Duration mediumDuration = Duration(milliseconds: 300);
  static const Duration longDuration = Duration(milliseconds: 500);
}

/// Health reminder frequency constants (in hours)
class ReminderFrequency {
  // Frequent reminders
  static const int hourly = 1;              // Every hour
  static const int everyTwoHours = 2;       // Every 2 hours
  static const int everyThreeHours = 3;     // Every 3 hours (hydration)
  static const int everyFourHours = 4;      // Every 4 hours
  static const int everySixHours = 6;       // Every 6 hours
  static const int everyEightHours = 8;     // Every 8 hours
  static const int everyTwelveHours = 12;   // Every 12 hours (twice daily)
  
  // Daily and multi-day reminders
  static const int daily = 24;              // Once per day
  static const int everyTwoDays = 48;       // Every 2 days
  static const int everyThreeDays = 72;     // Every 3 days
  
  // Weekly and monthly reminders
  static const int weekly = 168;            // Once per week (7 days)
  static const int monthly = 720;           // Once per month (30 days)
}

/// API and data fetching limits
class DataLimits {
  // Health reminders
  static const int healthRemindersLimit = 100;    // Max reminders to fetch from DB
  static const int healthRemindersToShow = 2;     // Number of reminders to display
  
  // News articles
  static const int newsArticlesDefault = 10;      // Default articles for home screen
  static const int newsArticlesMax = 30;          // Max articles to fetch from API
  static const int survivorStoryCount = 1;        // Number of survivor stories
  static const int newsArticlesCarousel = 5;      // Articles in carousel
  
  // General query limits
  static const int maxQueryResults = 50;          // Maximum results for any query
  static const int minQueryResults = 1;           // Minimum results for any query
}
