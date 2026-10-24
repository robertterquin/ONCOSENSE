import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCanUseApp } from '@/stores/authStore';
import { brand } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

// Five tabs from the redesign (docs/redesign). The floating bar is the Flutter
// main_navigation.dart look until redesign Phase 2 replaces it.

type IconName = ComponentProps<typeof MaterialIcons>['name'];

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'today', title: 'Today', icon: 'home' },
  { name: 'learn', title: 'Learn', icon: 'menu-book' },
  { name: 'journey', title: 'Journey', icon: 'auto-graph' },
  { name: 'community', title: 'Community', icon: 'forum' },
  { name: 'help', title: 'Help', icon: 'support-agent' },
];

export default function TabsLayout() {
  const canUseApp = useCanUseApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Signed out (and not a guest): back to Welcome. Replaces auth_state_listener.dart.
  if (!canUseApp) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.headerPink,
        tabBarInactiveTintColor: isDark ? colors.textSecondary : '#757575',
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 12,
          bottom: Math.max(insets.bottom, 16),
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          borderRadius: 30,
          borderTopWidth: 0,
          backgroundColor: isDark ? colors.card : brand.white,
          shadowColor: '#000000',
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -5 },
          elevation: 12,
        },
        tabBarItemStyle: { paddingTop: 2, paddingHorizontal: 0 },
        // Keep each tab's state when switching, like Flutter's IndexedStack.
        lazy: true,
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            // Semi-bold when selected, like Flutter. Five tabs leave room for 11px labels.
            tabBarLabel: ({ color, focused }) => (
              <Text
                numberOfLines={1}
                style={{
                  color: color as string,
                  fontFamily: focused ? fonts.semiBold : fonts.regular,
                  fontSize: 11,
                }}>
                {tab.title}
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={tab.icon} color={color as string} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
