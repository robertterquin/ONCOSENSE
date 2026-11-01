import { useAuthStore } from '@/stores/authStore';
import {
  DEFAULT_TIMES,
  DEFAULT_TYPES,
  migrateNotificationPrefs,
  useNotificationPrefs,
} from '@/stores/notificationStore';

import * as device from '../device';
import {
  handleNotificationTap,
  initializeNotifications,
  routeForNotification,
  setNotificationsEnabled,
  startNotificationListeners,
  setNotificationTypeEnabled,
  setReminderTime,
} from '../service';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));

// In-memory stand-in for the device's scheduled notifications.
jest.mock('../device', () => {
  const scheduled = new Map<string, unknown>();
  return {
    scheduled,
    configureNotifications: jest.fn(async () => {}),
    hasPermission: jest.fn(async () => true),
    requestPermission: jest.fn(async () => true),
    scheduleReminder: jest.fn(async (request: { identifier: string }) => {
      scheduled.set(request.identifier, request);
    }),
    presentNow: jest.fn(async () => true),
    scheduledIdentifiers: jest.fn(async () => [...scheduled.keys()]),
    cancelReminders: jest.fn(async (ids: string[]) => ids.forEach((id) => scheduled.delete(id))),
    cancelAllReminders: jest.fn(async () => scheduled.clear()),
    onNotificationTapped: jest.fn(() => () => {}),
  };
});

const scheduled = (device as unknown as { scheduled: Map<string, unknown> }).scheduled;
const ids = () => [...scheduled.keys()].sort();

/** A signed-in person going through treatment, so the daily check-in applies. */
const inTreatment = { id: 'u1', user_metadata: { journey_focus: 'treatment' } } as never;

beforeEach(() => {
  scheduled.clear();
  jest.clearAllMocks();
  useAuthStore.setState({ user: inTreatment, isGuest: false });
  useNotificationPrefs.setState({
    enabled: true,
    setupComplete: false,
    times: { ...DEFAULT_TIMES },
  });
  useNotificationPrefs.getState().setAllTypes(true);
});

describe('first launch and app start', () => {
  it('asks once, then schedules every reminder', async () => {
    await initializeNotifications();
    expect(device.requestPermission).toHaveBeenCalledTimes(1);
    expect(ids()).toEqual(['daily-checkin', 'self-check-monthly']);
    expect(useNotificationPrefs.getState().setupComplete).toBe(true);
  });

  it('does not finish setup when permission is denied', async () => {
    jest.mocked(device.requestPermission).mockResolvedValueOnce(false);
    await initializeNotifications();
    expect(scheduled.size).toBe(0);
    expect(useNotificationPrefs.getState().setupComplete).toBe(false);
  });

  it('reschedules switched-on types when the OS dropped them', async () => {
    useNotificationPrefs.setState({ setupComplete: true });
    useNotificationPrefs.getState().setType('daily_checkin', false);
    await initializeNotifications();
    expect(device.requestPermission).not.toHaveBeenCalled();
    expect(ids()).toEqual(['self-check-monthly']);
  });

  it('cancels reminders from removed types left on the phone', async () => {
    useNotificationPrefs.setState({ setupComplete: true });
    for (const id of ['hydration-08', 'movement-09', 'daily-tip', 'self-check-monthly']) {
      scheduled.set(id, {});
    }
    await initializeNotifications();
    expect(ids()).toEqual(['self-check-monthly']);
  });
});

describe('reminder times', () => {
  it('changing a time reschedules only that reminder', async () => {
    await initializeNotifications();
    const selfCheckBefore = scheduled.get('self-check-monthly');
    await setReminderTime('daily_checkin', { hour: 21, minute: 30 });
    expect(scheduled.get('daily-checkin')).toMatchObject({
      trigger: { kind: 'daily', hour: 21, minute: 30 },
    });
    // The self-check reminder is the same object: it wasn't cancelled and set again.
    expect(scheduled.get('self-check-monthly')).toBe(selfCheckBefore);
    expect(jest.mocked(device.cancelReminders).mock.calls.at(-1)?.[0]).toEqual(['daily-checkin']);
  });

  it('keeps a new time for a reminder that is off, without scheduling it', async () => {
    await initializeNotifications();
    await setNotificationTypeEnabled('daily_checkin', false);
    await setReminderTime('daily_checkin', { hour: 7, minute: 0 });
    expect(ids()).toEqual(['self-check-monthly']);
    expect(useNotificationPrefs.getState().times.daily_checkin).toEqual({ hour: 7, minute: 0 });
  });
});

describe('daily check-in and focus', () => {
  it('is not scheduled for Learning or for guests', async () => {
    useAuthStore.setState({
      user: { id: 'u1', user_metadata: { journey_focus: 'learning' } } as never,
    });
    await initializeNotifications();
    expect(ids()).toEqual(['self-check-monthly']);
  });

  it('treats an older account with a started journey as using Journey', async () => {
    useAuthStore.setState({
      user: { id: 'u1', user_metadata: { journey_started: true } } as never,
    });
    await initializeNotifications();
    expect(ids()).toEqual(['daily-checkin', 'self-check-monthly']);
  });
});

describe('app start for anyone', () => {
  it('cancels removed reminders without signing in', async () => {
    for (const id of ['hydration-08', 'sun-protection', 'weekly-checkin', 'daily-checkin']) {
      scheduled.set(id, {});
    }
    startNotificationListeners();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(ids()).toEqual(['daily-checkin']);
    expect(device.requestPermission).not.toHaveBeenCalled();
  });
});

describe('switches', () => {
  it('toggling a type only adds or removes that type', async () => {
    await initializeNotifications();
    await setNotificationTypeEnabled('daily_checkin', false);
    expect(ids()).toEqual(['self-check-monthly']);
    await setNotificationTypeEnabled('daily_checkin', true);
    expect(ids()).toEqual(['daily-checkin', 'self-check-monthly']);
  });

  it('the master switch cancels everything and turns every type off', async () => {
    await initializeNotifications();
    await setNotificationsEnabled(false);
    expect(scheduled.size).toBe(0);
    expect(Object.values(useNotificationPrefs.getState().types).every((on) => !on)).toBe(true);
    await setNotificationsEnabled(true);
    expect(scheduled.size).toBe(2);
    // Back to the defaults: the weekly tip stays off until someone turns it on.
    expect(useNotificationPrefs.getState().types).toEqual(DEFAULT_TYPES);
  });

  it('the weekly tip is off by default and can be turned on', async () => {
    await initializeNotifications();
    expect(ids()).not.toContain('weekly-tip');
    await setNotificationTypeEnabled('weekly_tip', true);
    expect(scheduled.get('weekly-tip')).toMatchObject({
      trigger: { kind: 'weekly', weekday: 7, hour: 10, minute: 0 },
    });
  });

  it('does not schedule a type while the master switch is off', async () => {
    useNotificationPrefs.setState({ enabled: false });
    await setNotificationTypeEnabled('self_check', true);
    expect(scheduled.size).toBe(0);
  });
});

describe('saved preferences from earlier versions', () => {
  it('drops removed types, keeps the remaining choices and adds the new ones', () => {
    const migrated = migrateNotificationPrefs(
      {
        enabled: true,
        setupComplete: true,
        types: { hydration: true, movement: true, self_check: false, weekly_checkin: true },
      },
      0,
    );
    expect(migrated).toEqual({
      enabled: true,
      setupComplete: true,
      types: { self_check: false, daily_checkin: true, appointments: true, weekly_tip: false },
      times: DEFAULT_TIMES,
    });
  });

  it('carries the weekly check-in choice over to the daily check-in', () => {
    expect(
      migrateNotificationPrefs({ types: { self_check: true, weekly_checkin: false } }, 1),
    ).toMatchObject({ types: { self_check: true, daily_checkin: false } });
  });

  it('adds times and the new types to version 2 preferences', () => {
    expect(
      migrateNotificationPrefs({ types: { self_check: true, daily_checkin: false } }, 2),
    ).toEqual({
      types: { self_check: true, daily_checkin: false, appointments: true, weekly_tip: false },
      times: DEFAULT_TIMES,
    });
  });

  it('leaves current preferences alone', () => {
    const current = { types: DEFAULT_TYPES, times: DEFAULT_TIMES };
    expect(migrateNotificationPrefs(current, 3)).toBe(current);
  });
});

describe('taps', () => {
  it('opens the related tab', () => {
    expect(routeForNotification('self_check')).toBe('/learn');
    expect(routeForNotification('screening')).toBe('/learn');
    expect(routeForNotification('weekly_check_in')).toBe('/journey');
    expect(routeForNotification('daily_check_in')).toBe('/journey');
    expect(routeForNotification('appointment')).toBe('/journey');
    expect(routeForNotification(null)).toBe('/today');
  });

  it('opens the screen for someone using the app', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    useAuthStore.setState({ isGuest: true });
    handleNotificationTap({
      identifier: 'daily-checkin',
      date: new Date(2026, 9, 26, 10, 0),
      title: 'Check-in',
      body: '',
      type: 'weekly_check_in',
      payload: 'weekly_check_in',
    });
    expect(router.push).toHaveBeenCalledWith('/journey');
  });
});
