# Splash Screen

The splash screen is the first screen users see when launching the CancerApp. It displays the pink ribbon logo with a fade-in animation and automatically transitions to the welcome screen after 3 seconds.

## Features

### Visual Elements
- **Pink Ribbon Logo**: Centered brand logo (200x200)
- **App Name**: "CancerApp" in bold pink text
- **Tagline**: "Empowering Awareness. Saving Lives."
- **Loading Indicator**: Animated circular progress indicator
- **Version Number**: App version displayed at the bottom
- **Background**: Soft pink gradient background matching app theme

### Animation
- **Fade-in Effect**: All elements fade in over 1.5 seconds using `FadeTransition`
- **Auto Navigation**: Automatically navigates to welcome screen after 3 seconds
- **Smooth Curves**: Uses `Curves.easeIn` for natural animation feel

### Technical Details
- **State Management**: Uses `SingleTickerProviderStateMixin` for animation
- **Duration**: 3-second total display time (1.5s fade-in + 1.5s display)
- **Navigation**: Uses `pushReplacementNamed` to prevent back navigation
- **Responsive**: Adapts to different screen sizes

## Usage

The splash screen is automatically shown as the initial route when the app starts:

```dart
// In main.dart
initialRoute: AppRoutes.splash,
```

## Customization Options

### Change Display Duration
Modify the `Future.delayed` duration in `initState()`:
```dart
// Currently set to 3 seconds
Future.delayed(const Duration(seconds: 3), () {
  // Navigation code
});
```

### Change Animation Duration
Modify the `AnimationController` duration:
```dart
_controller = AnimationController(
  duration: const Duration(milliseconds: 1500), // Change this
  vsync: this,
);
```

### Change Logo Size
Modify the `Image.asset` width and height:
```dart
Image.asset(
  'assets/images/pink_ribbon_logo.png',
  width: 200,  // Change size here
  height: 200,
  fit: BoxFit.contain,
);
```

### Change Background Gradient
Modify the gradient in the Container decoration:
```dart
decoration: BoxDecoration(
  gradient: AppTheme.pinkGradient, // Use different gradient
),
```

## File Structure
```
lib/screens/splash/
  splash_screen.dart  # Main splash screen widget
```

## Assets Required
- `assets/images/pink_ribbon_logo.png` - Pink ribbon logo image

## Navigation Flow
```
Splash Screen (3s)
    ↓
Welcome Screen
    ↓
Login/Register/Guest Mode
```

## Accessibility Considerations
- Logo has sufficient contrast against background
- Text is legible with appropriate font sizes
- Loading indicator provides visual feedback
- Animation respects reduced motion preferences (could be enhanced)

## Future Enhancements
- [ ] Check onboarding completion and navigate accordingly
- [ ] Load initial app data during splash
- [ ] Add skip button for returning users
- [ ] Implement reduced motion accessibility
- [ ] Cache check for first-time users
- [ ] Show different messages during loading
- [ ] Add error handling for asset loading
