class AppConstants {
  // App Info
  static const String appName = 'CancerApp';
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
