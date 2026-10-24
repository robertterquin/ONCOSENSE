import { migrateThemeState, useThemeStore } from '@/stores/themeStore';

import { resolveIsDark } from '../useTheme';

describe('resolveIsDark', () => {
  it('follows the setting, or the phone when set to match it', () => {
    expect(resolveIsDark('dark', 'light')).toBe(true);
    expect(resolveIsDark('light', 'dark')).toBe(false);
    expect(resolveIsDark('system', 'dark')).toBe(true);
    expect(resolveIsDark('system', 'light')).toBe(false);
    expect(resolveIsDark('system', null)).toBe(false);
  });
});

describe('theme store', () => {
  it('starts light until every screen is redesigned (Phase 7 switches to the phone)', () => {
    expect(useThemeStore.getState().mode).toBe('light');
  });
});

describe('migrateThemeState', () => {
  it('keeps the old dark-mode choice', () => {
    expect(migrateThemeState({ isDarkMode: true }, 0)).toEqual({
      mode: 'dark',
      textSize: 'default',
    });
    expect(migrateThemeState({ isDarkMode: false }, 0)).toEqual({
      mode: 'light',
      textSize: 'default',
    });
  });

  it('leaves current settings alone', () => {
    const current = { mode: 'system', textSize: 'large' };
    expect(migrateThemeState(current, 1)).toBe(current);
  });
});
