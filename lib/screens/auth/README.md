# Authentication Pages - CancerApp

This directory contains all authentication-related screens for the CancerApp.

## 📁 Structure

```
auth/
├── widgets/
│   ├── auth_button.dart      # Reusable gradient button with loading state
│   └── input_field.dart      # Reusable text input with validation
├── welcome_screen.dart        # Entry point with Get Started/Login options
├── register_screen.dart       # User registration with full validation
├── login_screen.dart          # User login with remember me option
└── forgot_password_screen.dart # Password reset flow
```

## 🎨 Design Features

### Pink Ribbon Theme
All auth screens follow the cancer awareness pink ribbon color scheme:
- **Primary Color**: `#E91E63` (Vibrant Pink)
- **Gradient Backgrounds**: Soft white-to-pink gradients
- **Accent Colors**: Purple (`#9C27B0`) for variety
- **Button Gradients**: Eye-catching pink gradient with shadow effects

### User Experience
- Clean, minimal design with ample whitespace
- Clear call-to-action buttons
- Helpful error messages
- Loading states for async operations
- Responsive layout for all screen sizes

## 📄 Screens Overview

### 1. Welcome Screen (`welcome_screen.dart`)
**Purpose**: First screen users see - introduces the app and provides entry points

**Features**:
- Pink ribbon logo/icon
- App name and tagline
- Brief description
- "Get Started" button (→ Register)
- "Login" link for existing users
- "Continue as Guest" option (browse without account)

**Navigation**:
- Get Started → `/register`
- Login → `/login`
- Continue as Guest → `/home` (TODO: implement)

---

### 2. Register Screen (`register_screen.dart`)
**Purpose**: Create new user account with comprehensive validation

**Form Fields**:
- ✅ **Full Name*** (required, min 2 characters)
- ✅ **Email*** (required, valid email format)
- ✅ **Password*** (required, min 6 characters, toggle visibility)
- ✅ **Confirm Password*** (required, must match password)
- ⚪ **Age** (optional, 13-120 range, numbers only)
- ⚪ **Gender** (optional dropdown: Male, Female, Non-binary, Prefer not to say)
- ✅ **Terms & Privacy Checkbox*** (required)

**Validation**:
- Real-time field validation on submit
- Regex email validation
- Password matching confirmation
- Age range validation (13-120)
- Terms acceptance required
- Clear error messages

**Features**:
- Password visibility toggle
- Rich text for terms/privacy policy links
- Loading state during registration
- Success snackbar message
- Auto-navigate to login after success

**Navigation**:
- Back button → Previous screen
- "Already have an account? Login" → `/login`
- Success → `/login`

---

### 3. Login Screen (`login_screen.dart`)
**Purpose**: Authenticate existing users

**Form Fields**:
- ✅ **Email** (required, valid format)
- ✅ **Password** (required, toggle visibility)
- ☑️ **Remember Me** (checkbox, TODO: implement persistence)

**Features**:
- Password visibility toggle
- Remember me checkbox
- "Forgot Password?" link
- Loading state during login
- Success snackbar message
- "Continue as Guest" alternative
- Clean divider with "OR" separator

**Navigation**:
- Back button → Previous screen
- Forgot Password → `/forgot-password`
- Continue as Guest → `/home` (TODO: implement)
- "Don't have an account? Register" → `/register`
- Success → `/home` (TODO: implement)

---

### 4. Forgot Password Screen (`forgot_password_screen.dart`)
**Purpose**: Password reset via email

**Two States**:

**A. Email Input Form**:
- Lock reset icon
- Title: "Reset Your Password"
- Description text
- Email input field with validation
- "Send Reset Link" button
- "Remember your password? Login" link

**B. Success State** (after sending):
- Green checkmark icon
- Success title: "Email Sent!"
- Confirmation message
- User's email displayed
- Info box with instructions (check spam, 24hr expiry)
- "Back to Login" button
- "Didn't receive the email? Resend" link

**Features**:
- Toggle between form and success views
- Email validation
- Loading state during send
- Resend functionality (returns to form)

**Navigation**:
- Back button → Previous screen
- "Remember your password? Login" → Previous screen
- "Back to Login" → Previous screen
- "Resend" → Returns to form view

---

## 🧩 Reusable Widgets

### AuthButton (`widgets/auth_button.dart`)
**Purpose**: Consistent button styling across auth screens

**Props**:
- `text` (String) - Button label
- `onPressed` (VoidCallback) - Tap handler
- `isLoading` (bool) - Shows circular progress indicator
- `isOutlined` (bool) - Outlined style vs filled gradient
- `width` (double?) - Custom width, defaults to full width

**Styles**:
- **Filled**: Pink gradient background with shadow
- **Outlined**: Pink border with transparent background

---

### InputField (`widgets/input_field.dart`)
**Purpose**: Consistent text input styling with validation

**Props**:
- `controller` (TextEditingController) - Input controller
- `label` (String) - Field label above input
- `hint` (String) - Placeholder text
- `isPassword` (bool) - Password field with visibility toggle
- `keyboardType` (TextInputType) - Keyboard type
- `validator` (Function?) - Validation function
- `prefixIcon` (Widget?) - Icon at start of field
- `suffixIcon` (Widget?) - Icon at end of field
- `maxLength` (int?) - Character limit
- `inputFormatters` (List?) - Input formatters (e.g., digits only)
- `enabled` (bool) - Enable/disable field
- `maxLines` (int) - Number of lines (default: 1)

**Features**:
- Auto password visibility toggle (eye icon)
- Light gray filled background
- Pink focus border
- Label above field
- Counter text hidden
- Support for validation errors

---

## 🔧 Supporting Files

### Theme (`utils/theme.dart`)
Defines app-wide theme with pink ribbon colors:
- Color constants (primary, light, dark, accent)
- Gradient definitions
- Light/dark theme data
- Input decoration theme
- Button themes
- Text themes

### Constants (`utils/constants.dart`)
App-wide constants:
- App info (name, version, tagline)
- Validation rules (min lengths, age limits)
- Error/success messages
- Gender options
- Spacing constants
- Border radius values
- Animation durations

### Routes (`utils/routes.dart`)
Named route definitions and handlers:
- Route name constants
- Route map for MaterialApp
- onGenerateRoute handler (for dynamic routes)
- onUnknownRoute fallback (defaults to welcome)

---

## 🚀 Usage

### Running the App
```bash
# Run on any device
flutter run

# Run on specific device
flutter run -d windows
flutter run -d chrome
```

The app starts at the **Welcome Screen** (`/welcome`).

### Navigation Flow
```
Welcome Screen
├─→ Register Screen → Login Screen → Home (TODO)
├─→ Login Screen
│   ├─→ Forgot Password Screen → Back to Login
│   └─→ Continue as Guest → Home (TODO)
└─→ Continue as Guest → Home (TODO)
```

---

## ⚠️ TODO Items

### Immediate
- [ ] Implement actual authentication logic (currently using mock delays)
- [ ] Connect to backend/Firebase Auth
- [ ] Implement "Remember Me" persistence (shared_preferences)
- [ ] Add email verification flow
- [ ] Implement home screen navigation
- [ ] Add guest mode state management

### Future Enhancements
- [ ] Social login (Google, Facebook, Apple)
- [ ] Biometric authentication (fingerprint/face)
- [ ] Password strength indicator
- [ ] Two-factor authentication
- [ ] Account recovery via phone number
- [ ] Terms & Privacy Policy screens
- [ ] Animated page transitions
- [ ] Accessibility improvements (screen readers)
- [ ] Unit tests for validation logic
- [ ] Integration tests for auth flow

---

## 🧪 Testing

Run tests:
```bash
flutter test
```

### Test Coverage Needed
- [ ] Email validation regex
- [ ] Password matching logic
- [ ] Age range validation
- [ ] Form submission with invalid data
- [ ] Navigation flows
- [ ] Widget rendering

---

## 📚 Dependencies

Current dependencies (from `pubspec.yaml`):
```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
```

### Recommended for Full Implementation
```yaml
dependencies:
  # State Management
  provider: ^6.1.1  # or riverpod

  # Local Storage
  shared_preferences: ^2.2.2

  # Authentication (choose one)
  firebase_auth: ^4.15.3
  # OR custom backend

  # Form Validation (optional - we have custom)
  # flutter_form_builder: ^9.1.1
```

---

## 🎯 Design Patterns

### State Management
Currently using `StatefulWidget` with `setState()`. For production:
- Consider **Provider** or **Riverpod** for auth state
- Manage user session across app
- Handle guest mode state

### Validation
- Centralized validation in constants
- Reusable validator functions
- Client-side validation only (add server-side)

### Error Handling
- SnackBar for user feedback
- Form field errors inline
- Loading states to prevent duplicate submissions

---

## 📱 Responsive Design

All screens are responsive:
- `SingleChildScrollView` prevents keyboard overflow
- `SafeArea` respects device notches/status bars
- Flexible layouts adapt to screen sizes
- Gradients scale properly

---

## 🔐 Security Notes

### Current Implementation
⚠️ **This is a UI-only implementation**. For production:

### Required Security Measures
1. **Password Security**:
   - Hash passwords server-side (never store plain text)
   - Use bcrypt/Argon2 hashing
   - Enforce strong password requirements

2. **Authentication**:
   - Implement JWT tokens or OAuth
   - Secure token storage (flutter_secure_storage)
   - Token refresh mechanisms
   - Session management

3. **API Communication**:
   - HTTPS only
   - Certificate pinning
   - API rate limiting
   - Input sanitization

4. **Data Protection**:
   - Encrypt sensitive data at rest
   - Secure local storage
   - Comply with GDPR/privacy laws

---

## 🎨 Customization

### Changing Colors
Edit `utils/theme.dart`:
```dart
static const Color primaryPink = Color(0xFFE91E63);  // Change here
```

### Modifying Validation Rules
Edit `utils/constants.dart`:
```dart
static const int minPasswordLength = 8;  // Change from 6 to 8
```

### Adding New Fields
1. Add controller in screen state
2. Add validation function
3. Add `InputField` widget in form
4. Update submit handler

---

## 📞 Support

For issues or questions:
- Check Flutter docs: https://flutter.dev/docs
- Review Copilot Instructions: `.github/copilot-instructions.md`
- Create an issue in the repository

---

## ✅ Completion Status

**Completed Features**:
- ✅ Welcome screen with gradient background
- ✅ Full registration form with validation
- ✅ Login screen with remember me
- ✅ Forgot password flow (UI only)
- ✅ Reusable auth widgets (button, input field)
- ✅ Pink ribbon theme implementation
- ✅ Named route navigation
- ✅ Form validation with error messages
- ✅ Loading states
- ✅ Success/error feedback

**Ready for Integration**:
- Backend authentication service
- State management implementation
- Onboarding flow connection
- Main app navigation

---

**Built with ❤️ for Cancer Awareness**
