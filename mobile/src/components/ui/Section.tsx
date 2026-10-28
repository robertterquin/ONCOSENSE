import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Palette } from '@/theme/palette';
import { radii, shadows, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Text } from './Text';

type SectionProps = {
  title?: string;
  subtitle?: string;
  /** Shown at the end of the title line (a small button or link). */
  action?: ReactNode;
  children: ReactNode;
  /**
   * `card`: white rounded container with dividers between rows (default).
   * `tinted`: a colored container (tips, help). `plain`: no container.
   */
  look?: 'card' | 'tinted' | 'plain';
  /** Background for `tinted`. */
  tint?: keyof Palette;
  /** Draws a line between direct children (rows). Default for `card`. */
  divided?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A titled group: the building block of every redesigned screen. */
export function Section({
  title,
  subtitle,
  action,
  children,
  look = 'card',
  tint = 'raised',
  divided = look === 'card',
  style,
}: SectionProps) {
  const { palette } = useDesign();
  const items = Children.toArray(children).filter(Boolean);
  const background =
    look === 'card' ? palette.surface : look === 'tinted' ? palette[tint] : 'transparent';

  return (
    <View style={[styles.section, style]}>
      {title ? (
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text variant="section" accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="supporting" tone="muted">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {action}
        </View>
      ) : null}
      <View
        style={[
          look !== 'plain' && styles.container,
          look === 'card' && [styles.cardContainer, { borderColor: palette.border }],
          look === 'tinted' && styles.tinted,
          !divided && styles.spaced,
          { backgroundColor: background },
        ]}>
        {items.map((item, index) => (
          <Fragment key={index}>
            {divided && index > 0 ? <Divider /> : null}
            {item}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

/** Hairline between rows, indented past the icon tile when `inset` is set. */
export function Divider({ inset = 0 }: { inset?: number }) {
  const { palette } = useDesign();
  return <View style={[styles.divider, { backgroundColor: palette.line, marginLeft: inset }]} />;
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.md,
    paddingHorizontal: space.xs,
  },
  headingText: { flex: 1, gap: 2 },
  container: { borderRadius: radii.section, paddingHorizontal: space.lg + 2 },
  cardContainer: {
    borderWidth: 1,
    ...shadows.card,
  },
  tinted: { paddingVertical: space.xl },
  /** Children that aren't divided rows (buttons, fields) get room between them. */
  spaced: { gap: space.md },
  divider: { height: StyleSheet.hairlineWidth * 2 },
});
