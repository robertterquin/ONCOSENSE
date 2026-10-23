import { useAuthStore } from '@/stores/authStore';
import { useNotificationHistory } from '@/stores/notificationHistoryStore';
import { useNotificationPrefs } from '@/stores/notificationStore';

import * as device from '../device';
import {
  addSampleNotificationsOnce,
  handleNotificationTap,
  initializeNotifications,
  recordDelivered,
  routeForNotification,
  setNotificationsEnabled,
  setNotificationTypeEnabled,
} from '../service';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/api/healthReminders', () => ({
  fetchActiveReminders: jest.fn(async () => [
    { id: 'tip-1', title: 'Eat Well', message: 'Eat more vegetables' },
  ]),
}));

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
    presentedNotifications: jest.fn(async () => []),
    onNotificationReceived: jest.fn(() => () => {}),
    onNotificationTapped: jest.fn(() => () => {}),
  };
});

const scheduled = (device as unknown as { scheduled: Map<string, unknown> }).scheduled;
const ids = () => [...scheduled.keys()].sort();

beforeEach(() => {
  scheduled.clear();
  jest.clearAllMocks();
  useNotificationPrefs.setState({ enabled: true, setupComplete: false });
  useNotificationPrefs.getState().setAllTypes(true);
  useNotificationHistory.setState({ notifications: [], samplesAdded: false });
});

describe('first launch and app start', () => {
  it('asks once, then schedules every reminder', async () => {
    await initializeNotifications();
    expect(device.requestPermission).toHaveBeenCalledTimes(1);
    expect(scheduled.size).toBe(14);
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
    useNotificationPrefs.getState().setType('hydration', false);
    await initializeNotifications();
    expect(device.requestPermission).not.toHaveBeenCalled();
    expect(ids().some((id) => id.startsWith('hydration-'))).toBe(false);
    expect(scheduled.size).toBe(8);
  });
});

describe('switches', () => {
  it('toggling a type only adds or removes that type', async () => {
    await initializeNotifications();
    await setNotificationTypeEnabled('movement', false);
    expect(ids().filter((id) => id.startsWith('movement-'))).toEqual([]);
    expect(scheduled.size).toBe(10);
    await setNotificationTypeEnabled('movement', true);
    expect(scheduled.size).toBe(14);
  });

  it('the master switch cancels everything and turns every type off', async () => {
    await initializeNotifications();
    await setNotificationsEnabled(false);
    expect(scheduled.size).toBe(0);
    expect(Object.values(useNotificationPrefs.getState().types).every((on) => !on)).toBe(true);
    await setNotificationsEnabled(true);
    expect(scheduled.size).toBe(14);
    expect(Object.values(useNotificationPrefs.getState().types).every(Boolean)).toBe(true);
  });

  it('does not schedule a type while the master switch is off', async () => {
    useNotificationPrefs.setState({ enabled: false });
    await setNotificationTypeEnabled('hydration', true);
    expect(scheduled.size).toBe(0);
  });
});

describe('history', () => {
  const delivered = {
    identifier: 'hydration-08',
    date: new Date(2026, 9, 23, 8, 0),
    title: '💧 Hydration Reminder',
    body: "💧 Don't forget to drink water!",
    type: 'hydration',
    payload: 'hydration:8',
    historyId: null,
  };

  it('records a delivered reminder once', () => {
    recordDelivered(delivered);
    recordDelivered(delivered);
    const { notifications } = useNotificationHistory.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ type: 'hydration', isRead: false });
  });

  it('marks a tapped notification read and opens its screen', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    useNotificationHistory.setState({ notifications: [] });
    useAuthStore.setState({ isGuest: true });
    handleNotificationTap({ ...delivered, type: 'weekly_check_in', identifier: 'weekly-checkin' });
    expect(useNotificationHistory.getState().notifications[0].isRead).toBe(true);
    expect(router.push).toHaveBeenCalledWith('/journey');
  });

  it('adds the sample notifications only once', () => {
    addSampleNotificationsOnce();
    expect(useNotificationHistory.getState().notifications.map((n) => n.title)).toEqual([
      '🚶 Movement Reminder',
      '💧 Hydration Reminder',
      '💡 Daily Health Tip',
    ]);
    useNotificationHistory.getState().clearAll();
    addSampleNotificationsOnce();
    expect(useNotificationHistory.getState().notifications).toHaveLength(0);
  });

  it('keeps at most 50 entries, newest first', () => {
    const { add } = useNotificationHistory.getState();
    for (let i = 0; i < 55; i++)
      add({ title: `#${i}`, body: '', type: 'hydration', timestamp: new Date(i * 1000) });
    const { notifications } = useNotificationHistory.getState();
    expect(notifications).toHaveLength(50);
    expect(notifications[0].title).toBe('#54');
  });
});

describe('history storage', () => {
  it('saves under stored_notifications with ISO timestamps and reloads dates', async () => {
    const timestamp = new Date(2026, 9, 23, 9, 0);
    useNotificationHistory
      .getState()
      .add({ id: 'a', title: 'Tip', body: 'Body', type: 'health_tip', timestamp });
    const saved = JSON.parse(localStorage.getItem('stored_notifications') ?? '{}');
    expect(saved.state.notifications[0]).toMatchObject({
      id: 'a',
      timestamp: timestamp.toISOString(),
      isRead: false,
    });

    useNotificationHistory.setState({ notifications: [] });
    localStorage.setItem('stored_notifications', JSON.stringify(saved));
    await useNotificationHistory.persist.rehydrate();
    const [reloaded] = useNotificationHistory.getState().notifications;
    expect(reloaded.timestamp).toBeInstanceOf(Date);
    expect(reloaded.timestamp.getTime()).toBe(timestamp.getTime());
  });
});

describe('routeForNotification', () => {
  it('opens the related screen', () => {
    expect(routeForNotification('self_check', 'self_check')).toBe('/prevention');
    expect(routeForNotification('forum_reply', 'forum_reply:q-1')).toBe('/forum/q-1');
    expect(routeForNotification('hydration', 'hydration:8')).toBe('/notifications');
    expect(routeForNotification(null, null)).toBe('/notifications');
  });
});
