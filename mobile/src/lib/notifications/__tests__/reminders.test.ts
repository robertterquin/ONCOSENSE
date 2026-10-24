import {
  CHANNELS,
  IDENTIFIER_PREFIX,
  IOS_PENDING_LIMIT,
  OBSOLETE_CHANNEL_IDS,
  SCHEDULED_PREF_TYPES,
  isCurrentReminder,
  remindersForType,
  screeningReminder,
  toExpoWeekday,
} from '../reminders';

const all = SCHEDULED_PREF_TYPES.flatMap((type) => remindersForType(type));

describe('toExpoWeekday', () => {
  it('maps Dart weekdays (1 = Monday) to expo weekdays (1 = Sunday)', () => {
    expect(toExpoWeekday(7)).toBe(1); // Sunday
    expect(toExpoWeekday(1)).toBe(2); // Monday
    expect(toExpoWeekday(6)).toBe(7); // Saturday
    expect([1, 2, 3, 4, 5, 6, 7].map(toExpoWeekday)).toEqual([2, 3, 4, 5, 6, 7, 1]);
  });

  it('rejects values outside 1–7', () => {
    expect(() => toExpoWeekday(0)).toThrow(RangeError);
    expect(() => toExpoWeekday(8)).toThrow(RangeError);
  });
});

describe('reminder schedule', () => {
  it('keeps only the self-check and check-in reminders', () => {
    expect(SCHEDULED_PREF_TYPES).toEqual(['self_check', 'daily_checkin']);
    expect(all.map((r) => r.identifier)).toEqual(['self-check-monthly', 'daily-checkin']);
    expect(all.length).toBeLessThan(IOS_PENDING_LIMIT);
  });

  it('schedules the self-exam monthly and the check-in every evening', () => {
    const [selfExam] = remindersForType('self_check');
    expect(selfExam.trigger).toEqual({ kind: 'monthly', day: 1, hour: 9, minute: 0 });
    expect(selfExam.channelId).toBe('screening_reminders');
    const [checkIn] = remindersForType('daily_checkin');
    expect(checkIn.trigger).toEqual({ kind: 'daily', hour: 20, minute: 0 });
    expect(checkIn.data.type).toBe('daily_check_in');
  });

  it('uses unique identifiers, each matching only its own type', () => {
    expect(new Set(all.map((r) => r.identifier)).size).toBe(all.length);
    for (const type of SCHEDULED_PREF_TYPES) {
      const prefix = IDENTIFIER_PREFIX[type];
      const own = remindersForType(type).map((r) => r.identifier);
      expect(all.filter((r) => r.identifier.startsWith(prefix)).map((r) => r.identifier)).toEqual(
        own,
      );
    }
  });

  it('uses only current channels', () => {
    const ids = CHANNELS.map((channel) => channel.id) as string[];
    for (const reminder of all) expect(ids).toContain(reminder.channelId);
    for (const obsolete of OBSOLETE_CHANNEL_IDS) expect(ids).not.toContain(obsolete);
  });
});

describe('isCurrentReminder', () => {
  it('keeps current reminders and flags removed ones', () => {
    for (const reminder of all) expect(isCurrentReminder(reminder.identifier)).toBe(true);
    const screening = screeningReminder('s1', 'Mammogram', 'Tomorrow', new Date(2026, 10, 1));
    expect(isCurrentReminder(screening.identifier)).toBe(true);
    for (const removed of ['daily-tip', 'hydration-08', 'movement-12', 'sun-protection']) {
      expect(isCurrentReminder(removed)).toBe(false);
    }
  });
});
