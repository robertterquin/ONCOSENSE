import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DateField, Chip, Icon, ListRow, Sheet, Switch, Text } from '@/components/ui';
import { useSelfChecks } from '@/hooks/useSelfChecks';
import { formatTime } from '@/lib/dates';
import {
  rescheduleSelfCheckReminder,
  setReminderTime,
  setNotificationTypeEnabled,
} from '@/lib/notifications/service';
import {
  useNotificationPrefs,
  type NotificationType,
  type ReminderTime,
} from '@/stores/notificationStore';
import { useSelfCheckStore } from '@/stores/selfCheckStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// One reminder in Settings (redesign Phase 6): a switch, and a sheet to change when it
// fires (and, for self-checks, which guides).

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TITLES: Record<NotificationType, string> = {
  self_check: 'Self-checks',
  daily_checkin: 'Daily check-in',
  appointments: 'Treatments and appointments',
  weekly_tip: 'Weekly health tip',
};

const toDate = (time: ReminderTime) => {
  const date = new Date();
  date.setHours(time.hour, time.minute, 0, 0);
  return date;
};

/** "On the day a check is due, 9:00 AM" */
function describeReminder(type: NotificationType, time: ReminderTime): string {
  const at = formatTime(toDate(time));
  switch (type) {
    case 'self_check':
      return `On the day a check is due, ${at}`;
    case 'daily_checkin':
      return `Every day, ${at}`;
    case 'appointments':
      return `The evening before, ${at}`;
    case 'weekly_tip':
      return `${WEEKDAYS[(time.weekday ?? 7) - 1]}s, ${at}`;
  }
}

export function ReminderRow({ type }: { type: NotificationType }) {
  const on = useNotificationPrefs((state) => state.enabled && state.types[type]);
  const masterOn = useNotificationPrefs((state) => state.enabled);
  const time = useNotificationPrefs((state) => state.times[type]);
  const [editing, setEditing] = useState(false);
  return (
    <>
      <ListRow
        title={TITLES[type]}
        subtitle={describeReminder(type, time)}
        accessibilityHint="Changes when this reminder comes"
        onPress={() => setEditing(true)}
        accessory={
          <Switch
            accessibilityLabel={TITLES[type]}
            value={on}
            onValueChange={(value) => void setNotificationTypeEnabled(type, value)}
          />
        }
      />
      <Sheet visible={editing} onClose={() => setEditing(false)} title={TITLES[type]}>
        {masterOn ? null : (
          <Text variant="supporting" tone="muted">
            Reminders are off. Turn them on above for this to take effect.
          </Text>
        )}
        <TimePicker
          value={time}
          onChange={(next) => void setReminderTime(type, { ...time, ...next })}
        />
        {type === 'weekly_tip' ? (
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Day">
            {WEEKDAYS.map((day, index) => (
              <Chip
                key={day}
                kind="radio"
                label={day.slice(0, 3)}
                selected={(time.weekday ?? 7) === index + 1}
                onPress={() => void setReminderTime(type, { ...time, weekday: index + 1 })}
              />
            ))}
          </View>
        ) : null}
        {type === 'self_check' ? <GuidePicker /> : null}
      </Sheet>
    </>
  );
}

function TimePicker({
  value,
  onChange,
}: {
  value: ReminderTime;
  onChange: (time: { hour: number; minute: number }) => void;
}) {
  const { palette } = useDesign();
  const date = toDate(value);
  return (
    <View style={styles.field}>
      <Text variant="row">Time</Text>
      <DateField
        mode="time"
        value={date}
        onChange={(picked) => onChange({ hour: picked.getHours(), minute: picked.getMinutes() })}
        accessibilityLabel={`Time, ${formatTime(date)}`}>
        <View
          style={[styles.box, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Icon name="clock" size={20} tone="action" />
          <Text variant="body">{formatTime(date)}</Text>
        </View>
      </DateField>
    </View>
  );
}

/** Which self-check guides count (the defaults come from the profile's gender). */
function GuidePicker() {
  const { all, mine } = useSelfChecks();
  const setChosen = useSelfCheckStore((state) => state.setChosen);
  const chosen = mine.map((status) => status.guide.id);
  const toggle = (id: string) => {
    const next = chosen.includes(id) ? chosen.filter((item) => item !== id) : [...chosen, id];
    setChosen(next);
    void rescheduleSelfCheckReminder();
  };
  return (
    <View style={styles.field}>
      <Text variant="row">Which guides</Text>
      <View style={styles.chips}>
        {all.map((status) => (
          <Chip
            key={status.guide.id}
            label={status.guide.title}
            selected={chosen.includes(status.guide.id)}
            onPress={() => toggle(status.guide.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 54,
    paddingHorizontal: space.lg,
    borderRadius: radii.control,
    borderWidth: 1.5,
  },
});
