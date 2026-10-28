import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { haptics } from '../haptics';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('triggers selection haptic on native', () => {
    haptics.selection();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('triggers light and medium impacts on native', () => {
    haptics.lightImpact();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');

    haptics.mediumImpact();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('triggers success and warning notifications on native', () => {
    haptics.success();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');

    haptics.warning();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('gracefully no-ops on web', () => {
    Platform.OS = 'web';
    haptics.selection();
    haptics.lightImpact();
    haptics.mediumImpact();
    haptics.success();
    haptics.warning();

    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
