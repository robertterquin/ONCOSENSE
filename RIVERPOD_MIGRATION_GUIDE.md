# State Management & Dependency Injection Migration Guide

## ✅ Completed Implementation

### 1. Core Setup
- ✅ Added `flutter_riverpod: ^2.6.1` and `get_it: ^8.0.3` to pubspec.yaml
- ✅ Created `lib/utils/service_locator.dart` with GetIt configuration
- ✅ Created provider files in `lib/providers/`:
  - `auth_provider.dart` - Authentication state management
  - `journey_provider.dart` - Journal entries, treatments, milestones
  - `bookmark_provider.dart` - Saved articles, cancer types, questions, resources
  - `theme_provider.dart` - Dark/light mode theming
  - `home_provider.dart` - Articles, health tips, health reminders
  - `notification_provider.dart` - App notifications management

### 2. Main App Refactoring
- ✅ Updated `main.dart`:
  - Wrapped app with `ProviderScope`
  - Initialize GetIt service locator before runApp
  - Converted `CancerApp` from StatefulWidget to ConsumerWidget
  - Theme now managed by Riverpod instead of manual ThemeProvider

### 3. JourneyScreen Refactoring
- ✅ Converted from `StatefulWidget` to `ConsumerStatefulWidget`
- ✅ Removed manual `_journeyService` instance
- ✅ Replaced `setState()` calls with `ref.watch()` and `ref.read()`
- ✅ Split build methods to use AsyncValue.when() pattern
- ✅ Added helper method `_calculateStreak()` since no longer from service

**Before:**
```dart
class JourneyScreen extends StatefulWidget {
  final JourneyService _journeyService = JourneyService();
  
  void _loadJourneyData() async {
    await _journeyService.initialize();
    setState(() { _isLoading = false; });
  }
}
```

**After:**
```dart
class JourneyScreen extends ConsumerStatefulWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final entriesAsync = ref.watch(journeyEntriesProvider);
    return entriesAsync.when(
      data: (entries) => _buildContent(entries),
      loading: () => CircularProgressIndicator(),
      error: (_, __) => Text('Error'),
    );
  }
}
```

## 📋 Remaining Screens to Migrate

### Priority 1: HomeScreen (High Impact)
**File:** `lib/screens/home/home_screen.dart`

**Current Issues:**
- Multiple `setState()` calls causing full widget rebuilds
- Manual service instances: `GNewsService()`, `HealthRemindersService()`, `BookmarkService()`
- setState called after dispose errors in console logs

**Required Changes:**
```dart
// Change from StatefulWidget
class HomeScreen extends StatefulWidget {

// To ConsumerStatefulWidget  
class HomeScreen extends ConsumerStatefulWidget {

// Replace service instances with GetIt
final gNewsService = getIt<GNewsService>();
final bookmarkService = getIt<BookmarkService>();

// Replace data loading with providers
@override
Widget build(BuildContext context, WidgetRef ref) {
  final articlesAsync = ref.watch(cancerArticlesProvider);
  final survivorStoryAsync = ref.watch(survivorStoryProvider);
  final dailyTip = ref.watch(dailyHealthTipProvider);
  final remindersAsync = ref.watch(healthRemindersProvider);
  final unreadCount = ref.watch(unreadNotificationCountProvider);
  
  return articlesAsync.when(
    data: (articles) => _buildHomeContent(articles, ...),
    loading: () => CircularProgressIndicator(),
    error: (_, __) => ErrorWidget(),
  );
}
```

### Priority 2: Profile/Settings Screens
**Files:** 
- `lib/screens/profile/profile_screen.dart`
- `lib/screens/profile/settings_screen.dart`

**Required Changes:**
- Use `authStateProvider` for user data
- Use `themeModeProvider` for theme toggling
- Replace manual theme switching with `ref.read(themeModeProvider.notifier).toggleTheme()`

```dart
// Theme toggle
await ref.read(themeModeProvider.notifier).toggleTheme();

// Get user info
final user = ref.watch(currentUserProvider);
final displayName = ref.watch(userDisplayNameProvider);
```

### Priority 3: Auth Screens
**Files:**
- `lib/screens/auth/login_screen.dart`
- `lib/screens/auth/register_screen.dart`
- `lib/screens/auth/welcome_screen.dart`

**Required Changes:**
- Listen to `authStateProvider` for navigation
- Use GetIt for `SupabaseService`

```dart
// Listen to auth state changes
ref.listen(authStateProvider, (previous, next) {
  next.whenData((authState) {
    if (authState.session != null) {
      Navigator.pushReplacementNamed(context, AppRoutes.home);
    }
  });
});
```

### Priority 4: Content Screens
**Files:**
- `lib/screens/cancer_info/cancer_info_screen.dart`
- `lib/screens/prevention/prevention_screen.dart`
- `lib/screens/forum/forum_screen.dart`
- `lib/screens/resources/resources_screen.dart`

**Required Changes:**
- Create providers for cancer types, prevention tips, forum questions, resources
- Use `bookmarkProvider.family` for bookmark states
- Replace manual service instantiation with GetIt

## 🔧 Migration Pattern Template

For any screen that needs migration:

### Step 1: Change Widget Type
```dart
// FROM:
class MyScreen extends StatefulWidget {
  @override
  State<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends State<MyScreen> {
  // ...
}

// TO:
class MyScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends ConsumerState<MyScreen> {
  // ...
}
```

### Step 2: Replace Service Instances
```dart
// FROM:
final myService = MyService();

// TO:
final myService = getIt<MyService>();
```

### Step 3: Replace setState with Providers
```dart
// FROM:
List<Item> items = [];
bool isLoading = true;

void loadData() async {
  final data = await myService.getData();
  setState(() {
    items = data;
    isLoading = false;
  });
}

// TO:
@override
Widget build(BuildContext context, WidgetRef ref) {
  final itemsAsync = ref.watch(itemsProvider);
  
  return itemsAsync.when(
    data: (items) => _buildContent(items),
    loading: () => CircularProgressIndicator(),
    error: (e, stack) => Text('Error: $e'),
  );
}
```

### Step 4: Handle User Actions
```dart
// FROM:
await myService.addItem(item);
setState(() {});

// TO:
await ref.read(itemsProvider.notifier).addItem(item);
// Provider automatically rebuilds dependent widgets
```

## 🎯 Benefits After Full Migration

1. **Performance**: Only affected widgets rebuild, not entire screens
2. **Memory**: No setState after dispose errors
3. **Testability**: Easy to mock providers in tests
4. **Maintainability**: Single source of truth for data
5. **Consistency**: User sees same data across all screens instantly

## 🚀 Next Steps

1. Migrate HomeScreen (highest priority - fixes console errors)
2. Migrate Settings/Profile screens (theme management)
3. Create additional providers as needed:
   - `lib/providers/cancer_info_provider.dart`
   - `lib/providers/prevention_provider.dart`
   - `lib/providers/forum_provider.dart`
   - `lib/providers/resources_provider.dart`
4. Test each screen after migration
5. Remove old `lib/services/theme_provider.dart` (replaced by Riverpod version)

## 📚 Key Riverpod Concepts

- **Provider**: Read-only, doesn't change (e.g., services, constants)
- **StateProvider**: Simple state that can be modified
- **FutureProvider**: Async data loading
- **StateNotifierProvider**: Complex state management with methods
- **Provider.family**: Dynamic providers with parameters (e.g., bookmark for specific article ID)

- **ref.watch()**: Rebuilds widget when provider changes
- **ref.read()**: One-time read, doesn't rebuild
- **ref.listen()**: Execute side effects on provider changes
