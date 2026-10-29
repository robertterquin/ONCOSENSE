import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Icon, PanelSurface, Text } from '@/components/ui';
import type { GuideStatus } from '@/hooks/useSelfChecks';
import { iconForCancer } from '@/lib/learn';
import { checkStatusLabel, formatMonthDay } from '@/lib/selfCheck';
import { darkPalette } from '@/theme/palette';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Today's checks card: every self-check the person follows, what's done and what's
// waiting, with Start on the one that has waited longest. When nothing is waiting it
// becomes the "all up to date" card with the next date. A smaller ribbon sits in the
// corner, behind the header only.

// The panel is dark in both themes, so done marks use the dark theme's teal.
const DONE = darkPalette.help;
const LINE = 'rgba(255, 255, 255, 0.12)';
const TILE = 'rgba(255, 255, 255, 0.10)';

type ChecksCardProps = {
  checks: GuideStatus[];
  snoozed: boolean;
  onSnooze: () => void;
  now: Date;
};

export function ChecksCard({ checks, snoozed, onSnooze, now }: ChecksCardProps) {
  const { palette } = useDesign();
  const byDue = [...checks].sort((a, b) => a.due.getTime() - b.due.getTime());
  const waiting = byDue.filter((check) => check.isDue);
  const upToDate = checks.length - waiting.length;
  const allDone = waiting.length === 0;
  const startId = waiting[0]?.guide.id;
  const open = (id: string) => router.push({ pathname: '/learn/check/[id]', params: { id } });

  const title = allDone ? 'All your checks are up to date' : 'Your checks';
  const body = allDone
    ? `Next: ${byDue[0].guide.cancerType}, ${formatMonthDay(byDue[0].due)}.`
    : snoozed
      ? "We'll remind you tomorrow."
      : `${upToDate} of ${checks.length} up to date. About 10 minutes each.`;

  return (
    <PanelSurface ribbonHeight={112} ribbonTop={-12}>
      <View style={styles.header}>
        <Text variant="heading" tone="onPanel" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="supporting" tone="onPanelMuted">
          {body}
        </Text>
      </View>

      <View>
        {checks.map((check) => {
          const label = checkStatusLabel(check.lastDone, check.due, now);
          return (
            <View key={check.guide.id} style={[styles.row, { borderTopColor: LINE }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${check.guide.title}, ${label}`}
                onPress={() => open(check.guide.id)}
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}>
                <View style={[styles.tile, { backgroundColor: TILE }]}>
                  <Icon
                    name={iconForCancer(check.guide.cancerType)}
                    size={24}
                    color={palette.onPanelAccent}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text variant="row" tone="onPanel">
                    {check.guide.cancerType}
                  </Text>
                  <View style={styles.status}>
                    {check.isDue ? null : <Icon name="circle-check" size={16} color={DONE} />}
                    <Text variant="caption" tone={check.isDue ? 'onPanelAccent' : 'onPanelMuted'}>
                      {label}
                    </Text>
                  </View>
                </View>
              </Pressable>
              {check.guide.id === startId ? (
                <Button
                  title="Start"
                  variant="onPanel"
                  small
                  accessibilityHint={`Starts the ${check.guide.title}`}
                  onPress={() => open(check.guide.id)}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      {allDone ? (
        <Button
          title="Learn the early signs"
          variant="onPanelAccent"
          onPress={() => router.navigate('/learn')}
        />
      ) : snoozed ? null : (
        <Button title="Remind me tomorrow" variant="onPanelAccent" onPress={onSnooze} />
      )}
    </PanelSurface>
  );
}

const styles = StyleSheet.create({
  // Clear of the corner ribbon.
  header: { gap: space.xs, maxWidth: '84%', marginBottom: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: sizes.touch,
    paddingVertical: space.md,
  },
  rowText: { flex: 1, gap: 2 },
  status: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
});
