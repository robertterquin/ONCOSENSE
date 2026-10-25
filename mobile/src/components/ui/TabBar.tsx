import type { BottomTabBarProps } from 'expo-router/tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radii, space } from '@/theme/tokens';
import { fontFamily, TEXT_SIZES } from '@/theme/type';
import { useDesign } from '@/theme/useTheme';

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
 * A floating violet pill: the open tab expands into a white pill with its icon and name,
 * the others show their icon (screen readers still hear every name). Sits below the
 * screens rather than over them, so nothing scrolls behind it.
 * Pass to `<Tabs tabBar={(props) => <TabBar {...props} />}>`.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const { palette, textSize } = useDesign();
  // Phones shrink a long label to fit (`adjustsFontSizeToFit`); browsers can't, so the
  // web keeps labels at the default size.
  const labelSize = Platform.OS === 'web' ? 14 : Math.round(14 * TEXT_SIZES[textSize]);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outer,
        { backgroundColor: palette.ground, paddingBottom: Math.max(insets.bottom, space.md) },
      ]}>
      <View accessibilityRole="tablist" style={[styles.bar, { backgroundColor: palette.panel }]}>
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
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Animated.View
              key={route.key}
              layout={LinearTransition.duration(200)}
              style={focused ? styles.activeSlot : styles.slot}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={`${label}, tab ${index + 1} of ${state.routes.length}`}
                onPress={onPress}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                style={[styles.tab, focused && { backgroundColor: palette.onPanel }]}>
                <Icon
                  name={TAB_ICONS[route.name] ?? 'home'}
                  size={22}
                  color={focused ? palette.panel : palette.onPanelMuted}
                />
                {focused && (
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    maxFontSizeMultiplier={1.3}
                    style={{
                      color: palette.panel,
                      fontSize: labelSize,
                      lineHeight: Math.round(labelSize * 1.3),
                      fontFamily: fontFamily.extraBold,
                    }}>
                    {label}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: space.lg, paddingTop: space.sm },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.xs + 2,
    borderRadius: radii.round,
    minHeight: TAB_BAR_HEIGHT,
  },
  slot: { flex: 1 },
  activeSlot: { flexShrink: 0 },
  tab: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.md + 2,
    borderRadius: radii.round,
  },
});
