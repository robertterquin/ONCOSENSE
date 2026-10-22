import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';
import { MaterialIcon } from './MaterialIcon';

type SectionCardProps = {
  title: string;
  /** Material icon name. */
  icon: string;
  iconColor: string;
  children: ReactNode;
};

/** Card with a tinted icon chip and title (Flutter's `_buildModernCard`). */
export function SectionCard({ title, icon, iconColor, children }: SectionCardProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.divider },
        !isDark && styles.shadow,
      ]}>
      <View style={styles.header}>
        <View style={[styles.iconChip, { backgroundColor: `${iconColor}1A` }]}>
          <MaterialIcon name={icon} size={20} color={iconColor} />
        </View>
        <AppText variant="titleMedium" style={styles.title}>
          {title}
        </AppText>
      </View>
      {children}
    </View>
  );
}

type BulletListProps = {
  items: string[];
  /** Bullet color. */
  color: string;
};

/** Pink-dot list with relaxed line height (Flutter's `_buildModernList`). */
export function BulletList({ items, color }: BulletListProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${index}-${item}`} style={styles.item}>
          <View style={[styles.bulletRing, { backgroundColor: `${color}26` }]}>
            <View style={[styles.bullet, { backgroundColor: color }]} />
          </View>
          <AppText style={[styles.itemText, { color: colors.text }]}>{item}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: radius.large,
    borderWidth: 1,
    gap: 16,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconChip: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    flex: 1,
    letterSpacing: -0.2,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletRing: {
    marginTop: 7,
    padding: 3,
    borderRadius: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemText: {
    flex: 1,
    lineHeight: 22,
    opacity: 0.85,
  },
});
