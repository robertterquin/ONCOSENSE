import { StyleSheet, View } from 'react-native';

import type { Palette } from '@/theme/palette';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Icon } from './Icon';
import { Text } from './Text';

export type TagTone = 'due' | 'done' | 'next';

const TAGS: Record<TagTone, { background: keyof Palette; color: keyof Palette }> = {
  due: { background: 'roseTint', color: 'rose' },
  done: { background: 'helpTint', color: 'onHelpTint' },
  next: { background: 'raised', color: 'action' },
};

/** A small rounded state label ("Due", "Done 6 days ago"). The words carry the state; color only backs it up. */
export function Tag({ tone, label }: { tone: TagTone; label: string }) {
  const { palette } = useDesign();
  const look = TAGS[tone];
  return (
    <View style={[styles.tag, { backgroundColor: palette[look.background] }]}>
      {tone === 'done' ? <Icon name="check" size={14} tone={look.color} strokeWidth={2.5} /> : null}
      <Text variant="caption" tone={look.color}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radii.round,
  },
});
