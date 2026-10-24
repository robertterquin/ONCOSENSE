import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components/ui';
import { useCanUseApp } from '@/stores/authStore';

// Five tabs from the redesign (docs/redesign) with the redesign's tab bar: white,
// labelled, the active tab marked by a lavender pill and a bold label.

const TABS = [
  { name: 'today', title: 'Today' },
  { name: 'learn', title: 'Learn' },
  { name: 'journey', title: 'Journey' },
  { name: 'community', title: 'Community' },
  { name: 'help', title: 'Help' },
];

export default function TabsLayout() {
  const canUseApp = useCanUseApp();

  // Signed out (and not a guest): back to Welcome. Replaces auth_state_listener.dart.
  if (!canUseApp) return <Redirect href="/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Keep each tab's state when switching, like Flutter's IndexedStack.
        lazy: true,
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
