# Riverpod & GetIt Quick Reference

## 🎯 Quick Conversion Cheat Sheet

### 1. Convert Widget Type
```dart
// CHANGE THIS:
class MyScreen extends StatefulWidget {
  @override
  State<MyScreen> createState() => _MyScreenState();
}
class _MyScreenState extends State<MyScreen> {

// TO THIS:
class MyScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<MyScreen> createState() => _MyScreenState();
}
class _MyScreenState extends ConsumerState<MyScreen> {
```

### 2. Replace Service Instances
```dart
// REMOVE:
final myService = MyService();

// ADD:
final myService = getIt<MyService>();
```

### 3. Update Build Method Signature
```dart
// FROM:
@override
Widget build(BuildContext context) {

// TO:
@override
Widget build(BuildContext context, WidgetRef ref) {
```

### 4. Watch Data from Providers
```dart
// LOADING STATE (FutureProvider)
final dataAsync = ref.watch(myDataProvider);
return dataAsync.when(
  data: (data) => Text('Loaded: $data'),
  loading: () => CircularProgressIndicator(),
  error: (e, stack) => Text('Error: $e'),
);

// SIMPLE VALUE (Provider)
final value = ref.watch(myValueProvider);
return Text('Value: $value');

// STATE WITH ACTIONS (StateNotifierProvider)
final items = ref.watch(itemsProvider);
return items.when(
  data: (list) => ListView(children: list.map(...)),
  loading: () => CircularProgressIndicator(),
  error: (e, _) => Text('Error'),
);
```

### 5. User Actions
```dart
// READ (one-time, no rebuild)
final notifier = ref.read(itemsProvider.notifier);
await notifier.addItem(item);

// Or inline:
await ref.read(itemsProvider.notifier).addItem(item);
```

### 6. Listen to Changes (Side Effects)
```dart
@override
void initState() {
  super.initState();
  
  // Listen to auth changes
  ref.listen(authStateProvider, (previous, next) {
    next.whenData((authState) {
      if (authState.session != null) {
        Navigator.pushNamed(context, '/home');
      }
    });
  });
}
```

## 📦 Available Providers

### Auth
```dart
ref.watch(currentUserProvider)              // User?
ref.watch(userIdProvider)                   // String?
ref.watch(isAuthenticatedProvider)          // bool
ref.watch(userDisplayNameProvider)          // String
ref.watch(userProfilePictureProvider)       // String?
```

### Journey
```dart
ref.watch(journeyEntriesProvider)           // AsyncValue<List<JourneyEntry>>
ref.watch(journeyTreatmentsProvider)        // AsyncValue<List<Treatment>>
ref.watch(journeyMilestonesProvider)        // AsyncValue<List<Milestone>>
ref.watch(journeyStartedProvider)           // AsyncValue<bool>
ref.watch(journeySetupProvider)             // AsyncValue<Map?>

// Actions
ref.read(journeyEntriesProvider.notifier).addEntry(entry)
ref.read(journeyEntriesProvider.notifier).updateEntry(entry)
ref.read(journeyEntriesProvider.notifier).deleteEntry(id)
ref.read(journeyEntriesProvider.notifier).refresh()
```

### Home
```dart
ref.watch(cancerArticlesProvider)           // AsyncValue<List<Article>>
ref.watch(survivorStoryProvider)            // AsyncValue<Article?>
ref.watch(dailyHealthTipProvider)           // HealthTip
ref.watch(healthRemindersProvider)          // AsyncValue<List<HealthReminder>>
```

### Bookmarks
```dart
ref.watch(bookmarkedArticlesProvider)       // AsyncValue<List<Article>>
ref.watch(bookmarkedCancerTypesProvider)    // AsyncValue<List<CancerType>>
ref.watch(articleBookmarkProvider(id))      // AsyncValue<bool>
// (Similar for questions, resources, tips, guides)
```

### Theme
```dart
ref.watch(themeModeProvider)                // ThemeMode
ref.watch(isDarkModeProvider)               // bool

// Toggle theme
ref.read(themeModeProvider.notifier).toggleTheme()
```

### Notifications
```dart
ref.watch(notificationsProvider)            // AsyncValue<List<AppNotification>>
ref.watch(unreadNotificationCountProvider)  // int
ref.watch(unreadNotificationsProvider)      // List<AppNotification>

// Actions
ref.read(notificationsProvider.notifier).markAsRead(id)
ref.read(notificationsProvider.notifier).markAllAsRead()
ref.read(notificationsProvider.notifier).deleteNotification(id)
ref.read(notificationsProvider.notifier).refresh()
```

## 🔧 GetIt Services

```dart
getIt<SupabaseService>()
getIt<JourneyService>()
getIt<BookmarkService>()
getIt<CancerInfoService>()
getIt<PreventionService>()
getIt<ResourcesService>()
getIt<ForumService>()
getIt<GNewsService>()
getIt<HealthTipsService>()
getIt<HealthRemindersService>()
getIt<NotificationService>()
getIt<NotificationStorageService>()
```

## 🎨 Common Patterns

### Pattern: Loading List with Actions
```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  final itemsAsync = ref.watch(itemsProvider);
  
  return Scaffold(
    body: itemsAsync.when(
      data: (items) => ListView.builder(
        itemCount: items.length,
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(items[index].name),
            trailing: IconButton(
              icon: Icon(Icons.delete),
              onPressed: () {
                ref.read(itemsProvider.notifier).deleteItem(items[index].id);
              },
            ),
          );
        },
      ),
      loading: () => CircularProgressIndicator(),
      error: (e, _) => Text('Error: $e'),
    ),
    floatingActionButton: FloatingActionButton(
      onPressed: () async {
        final newItem = await showAddDialog(context);
        if (newItem != null) {
          await ref.read(itemsProvider.notifier).addItem(newItem);
        }
      },
      child: Icon(Icons.add),
    ),
  );
}
```

### Pattern: Conditional UI Based on Auth
```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  final isAuthenticated = ref.watch(isAuthenticatedProvider);
  final userName = ref.watch(userDisplayNameProvider);
  
  return Scaffold(
    appBar: AppBar(
      title: Text(isAuthenticated ? 'Welcome, $userName' : 'Welcome, Guest'),
      actions: [
        if (isAuthenticated)
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              await getIt<SupabaseService>().signOut();
              // authProvider will automatically update
            },
          ),
      ],
    ),
    body: isAuthenticated ? HomeContent() : WelcomeScreen(),
  );
}
```

### Pattern: Refresh Data
```dart
// Pull to refresh
RefreshIndicator(
  onRefresh: () async {
    await ref.read(itemsProvider.notifier).refresh();
  },
  child: ListView(...),
)

// Force reload
ElevatedButton(
  onPressed: () {
    ref.invalidate(itemsProvider); // Completely reload
  },
  child: Text('Reload'),
)
```

### Pattern: Theme Toggle
```dart
IconButton(
  icon: Icon(ref.watch(isDarkModeProvider) ? Icons.light_mode : Icons.dark_mode),
  onPressed: () {
    ref.read(themeModeProvider.notifier).toggleTheme();
  },
)
```

## 🐛 Debugging

### Print Provider State
```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  ref.listen(myProvider, (previous, next) {
    print('Provider changed from $previous to $next');
  });
  
  final data = ref.watch(myProvider);
  return Text('$data');
}
```

### Check Provider in DevTools
1. Run app with `flutter run -d chrome`
2. Open DevTools
3. Click "Provider" tab
4. See all provider states and dependencies

## ⚠️ Common Mistakes

### ❌ DON'T: Use ref.watch in callbacks
```dart
onPressed: () {
  final data = ref.watch(myProvider); // ❌ ERROR
}
```

### ✅ DO: Use ref.read in callbacks
```dart
onPressed: () {
  final data = ref.read(myProvider); // ✅ CORRECT
}
```

### ❌ DON'T: setState with providers
```dart
setState(() {
  items = newItems; // ❌ Mixing patterns
});
```

### ✅ DO: Update through provider
```dart
ref.read(itemsProvider.notifier).updateItems(newItems); // ✅ CORRECT
```

### ❌ DON'T: Create service instances
```dart
final service = MyService(); // ❌ Creates new instance
```

### ✅ DO: Use GetIt
```dart
final service = getIt<MyService>(); // ✅ Uses singleton
```

## 🎓 Learning Resources

- **Riverpod Docs**: https://riverpod.dev
- **GetIt Docs**: https://pub.dev/packages/get_it
- **Example**: See `lib/screens/journey/journey_screen.dart` for full implementation

---

**Quick Start:** Copy any ConsumerStatefulWidget pattern from JourneyScreen as a template!
