import {
  CHANNELS,
  IDENTIFIER_PREFIX,
  IOS_PENDING_LIMIT,
  SCHEDULED_PREF_TYPES,
  remindersForType,
  toExpoWeekday,
  type ReminderRequest,
} from '../reminders';

const tip = {
  id: 'hydration_1',
  title: 'Stay Hydrated',
  message: 'Drink 8 glasses of water daily',
};
const all = SCHEDULED_PREF_TYPES.flatMap((type) => remindersForType(type, tip));
const time = (r: ReminderRequest) =>
  'hour' in r.trigger ? `${r.trigger.hour}:${String(r.trigger.minute).padStart(2, '0')}` : null;

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

describe('reminder schedule (same as notification_service.dart)', () => {
  it('schedules the daily tip at 9:00 with the tip as content', () => {
    const [daily] = remindersForType('health_tips', tip);
    expect(daily).toMatchObject({
      identifier: 'daily-tip',
      title: '💡 Stay Hydrated',
      body: 'Drink 8 glasses of water daily',
      channelId: 'health_reminders',
      data: { type: 'health_tip', payload: 'health_tip:hydration_1' },
    });
    expect(time(daily)).toBe('9:00');
  });

  it('schedules hydration every 2 hours from 8:00 (six messages, so the last is 18:00)', () => {
    const hydration = remindersForType('hydration', tip);
    expect(hydration.map(time)).toEqual(['8:00', '10:00', '12:00', '14:00', '16:00', '18:00']);
    expect(hydration[0].identifier).toBe('hydration-08');
    expect(hydration[0].data.payload).toBe('hydration:8');
    expect(hydration[0].body).toBe("💧 Don't forget to drink water!");
  });

  it('schedules movement every 3 hours from 9:30', () => {
    const movement = remindersForType('movement', tip);
    expect(movement.map(time)).toEqual(['9:30', '12:30', '15:30', '18:30']);
    expect(movement.map((r) => r.data.payload)).toEqual([
      'movement:9',
      'movement:12',
      'movement:15',
      'movement:18',
    ]);
  });

  it('schedules sun protection daily, self-exam monthly and the check-in on Sundays', () => {
    const [sun] = remindersForType('sun_protection', tip);
    expect(sun.trigger).toEqual({ kind: 'daily', hour: 10, minute: 0 });
    const [selfExam] = remindersForType('self_check', tip);
    expect(selfExam.trigger).toEqual({ kind: 'monthly', day: 1, hour: 9, minute: 0 });
    expect(selfExam.channelId).toBe('screening_reminders');
    const [checkIn] = remindersForType('weekly_checkin', tip);
    expect(checkIn.trigger).toEqual({ kind: 'weekly', weekday: 7, hour: 10, minute: 0 });
    expect(checkIn.data.type).toBe('weekly_check_in');
  });

  it('stays far below the iOS limit of 64 pending notifications', () => {
    expect(all).toHaveLength(14);
    expect(all.length).toBeLessThan(IOS_PENDING_LIMIT);
  });

  it('uses unique identifiers, each matching only its own type', () => {
    expect(new Set(all.map((r) => r.identifier)).size).toBe(all.length);
    for (const type of SCHEDULED_PREF_TYPES) {
      const prefix = IDENTIFIER_PREFIX[type];
      const own = remindersForType(type, tip).map((r) => r.identifier);
      expect(all.filter((r) => r.identifier.startsWith(prefix)).map((r) => r.identifier)).toEqual(
        own,
      );
    }
  });

  it('only uses the six Flutter channels', () => {
    const ids = CHANNELS.map((channel) => channel.id);
    expect(ids).toHaveLength(6);
    for (const reminder of all) expect(ids).toContain(reminder.channelId);
  });
});
