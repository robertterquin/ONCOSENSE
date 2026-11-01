import { StyleSheet, View } from 'react-native';

import type { Palette } from '@/theme/palette';
import { elevation, pressedCard } from '@/theme/elevation';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { TILES, type TileTone } from './ListRow';
import { Text } from './Text';

type StatTileProps = {
  label: string;
  value: string;
  /** One line under the number ("of 10, up from 5"). */
  detail: string;
  valueTone?: keyof Palette;
};

/** A big number with its label and trend, read as one sentence ("Energy, 7 days: 6.2, of 10, up from 5"). */
export function StatTile({ label, value, detail, valueTone = 'action' }: StatTileProps) {
  const { palette, isDark } = useDesign();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}, ${detail}`}
      style={[
        styles.tile,
        { backgroundColor: palette.surface },
        elevation('resting', palette, isDark),
      ]}>
      <Text variant="supporting" tone="muted">
        {label}
      </Text>
      <Text variant="heading" tone={valueTone}>
        {value}
      </Text>
      <Text variant="supporting" tone="muted">
        {detail}
      </Text>
    </View>
  );
}

type TopicTileProps = {
  title: string;
  subtitle?: string;
  icon: IconName;
  iconTone?: TileTone;
  onPress: () => void;
};

/** A tappable tile for two-column grids: icon tile, title and one short line. */
export function TopicTile({ title, subtitle, icon, iconTone = 'action', onPress }: TopicTileProps) {
  const { palette, isDark } = useDesign();
  const look = TILES[iconTone];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: palette.surface },
        elevation('resting', palette, isDark),
        pressed && pressedCard,
      ]}>
      <View style={[styles.well, { backgroundColor: palette[look.background] }]}>
        <Icon name={icon} size={22} tone={look.color} />
      </View>
      <Text variant="row">{title}</Text>
      {subtitle ? (
        <Text variant="supporting" tone="muted">
          {subtitle}
        </Text>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: space.xs, padding: space.md + 2, borderRadius: radii.section },
  well: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
});
