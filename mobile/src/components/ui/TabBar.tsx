import type { BottomTabBarProps } from 'expo-router/tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { elevation } from '@/theme/elevation';
import { radii, space } from '@/theme/tokens';
import { fontFamily, TEXT_SIZES } from '@/theme/type';
import { useDesign } from '@/theme/useTheme';
import { haptics } from '@/lib/haptics';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** Height above the home indicator; screens in tabs leave this much room. */
export const TAB_BAR_HEIGHT = 64;

/** Icon for each tab route (`app/(tabs)/<name>.tsx`). */
export const TAB_ICONS: Record<string, IconName> = {
  today: 'home',
  learn: 'book',
  journey: 'activity',
  community: 'users',
  help: 'life-buoy',
};

/**
 * A light floating dock with every tab named: the open tab gets a lavender pill behind its
 * icon and a bold label. Sits below the screens rather than over them, so nothing scrolls
 * behind it. Pass to `<Tabs tabBar={(props) => <TabBar {...props} />}>`.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const { palette, textSize, isDark } = useDesign();
  // Phones shrink a long label to fit (`adjustsFontSizeToFit`); browsers can't, so the
  // web keeps labels at the default size ("Community" would be cut off at 375 px).
  const labelSize = Platform.OS === 'web' ? 12 : Math.round(13 * TEXT_SIZES[textSize]);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outer,
        { backgroundColor: palette.ground, paddingBottom: Math.max(insets.bottom, space.md) },
      ]}>
      <View
        accessibilityRole="tablist"
        style={[
          styles.bar,
          { backgroundColor: palette.surface, borderColor: palette.border },
          elevation('floating', isDark),
        ]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              haptics.selection();
              navigateToTab(route.key);
            }
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={`${label}, tab ${index + 1} of ${state.routes.length}`}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.tab}>
              <View style={[styles.pill, focused && { backgroundColor: palette.raised }]}>
                <Icon
                  name={TAB_ICONS[route.name] ?? 'home'}
                  size={22}
                  tone={focused ? 'action' : 'muted'}
                />
              </View>
              <Text
                variant="caption"
                tone={focused ? 'action' : 'muted'}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                maxFontSizeMultiplier={1.3}
                style={{
                  fontSize: labelSize,
                  lineHeight: Math.round(labelSize * 1.3),
                  fontFamily: focused ? fontFamily.extraBold : fontFamily.semiBold,
                }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: space.md, paddingTop: space.sm },
  bar: {
    flexDirection: 'row',
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
    borderRadius: radii.panel,
    borderWidth: 1.5,
    minHeight: TAB_BAR_HEIGHT,
  },
  tab: { flex: 1, alignItems: 'center', gap: space.xs },
  pill: {
    width: 52,
    height: 32,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
