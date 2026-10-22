import { getSupabaseConfig } from '@/lib/env';

describe('getSupabaseConfig', () => {
  it('returns trimmed values when both variables are set', () => {
    expect(
      getSupabaseConfig({
        EXPO_PUBLIC_SUPABASE_URL: ' https://example.supabase.co ',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      }),
    ).toEqual({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  it('throws a setup hint when a variable is missing', () => {
    expect(() =>
      getSupabaseConfig({ EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' }),
    ).toThrow(/mobile\/\.env/);
  });

  it('treats blank values as missing', () => {
    expect(() =>
      getSupabaseConfig({ EXPO_PUBLIC_SUPABASE_URL: ' ', EXPO_PUBLIC_SUPABASE_ANON_KEY: ' ' }),
    ).toThrow();
  });
});
