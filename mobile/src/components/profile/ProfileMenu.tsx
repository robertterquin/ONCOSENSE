import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// Menu cards from profile_screen.dart and settings_screen.dart.

/** Small gray heading above a menu card. */
export function MenuHeading({ children }: { children: string }) {
  return (
    <AppText variant="label" secondary style={styles.heading}>
      {children}
    </AppText>
  );
}

/** White rounded card with dividers between its items. */
export function MenuGroup({ children }: { children: ReactNode }) {
  const { colors, isDark } = useTheme();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, { backgroundColor: colors.card }, !isDark && styles.shadow]}>
      {items.map((item, index) => (
        <View key={index}>
          {index > 0 ? (
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          ) : null}
          {item}
        </View>
      ))}
    </View>
  );
}

type MenuItemProps = {
  icon: string;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle?: string;
  titleColor?: string;
  /** Count bubble before the arrow. */
  badge?: number;
  onPress?: () => void;
  /** Replaces the arrow (e.g. a Switch). */
  right?: ReactNode;
};

export function MenuItem({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  titleColor,
  badge,
  onPress,
  right,
}: MenuItemProps) {
  const { colors, isDark } = useTheme();
  const content = (
    <>
      <View style={[styles.icon, { backgroundColor: isDark ? `${iconColor}33` : iconBackground }]}>
        <MaterialIcon name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.text}>
        <AppText variant="label" color={titleColor ?? colors.text} style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" secondary>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: iconColor }]}>
          <AppText style={styles.badgeText}>{badge}</AppText>
        </View>
      ) : null}
      {right ??
        (onPress ? (
          <MaterialIcon name="arrow_forward_ios" size={16} color={colors.textSecondary} />
        ) : null)}
    </>
  );

  if (!onPress) return <View style={styles.item}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  group: { borderRadius: radius.large, overflow: 'hidden' },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  divider: { height: 1, marginLeft: 72 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pressed: { backgroundColor: 'rgba(216,27,96,0.05)' },
  icon: { padding: 10, borderRadius: 12 },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 15 },
  badge: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgeText: { fontSize: 12, color: brand.white, fontFamily: 'Poppins_700Bold' },
});
