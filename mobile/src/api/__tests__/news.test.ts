import { ilikeValue } from '@/api/errors';
import { isFromTrustedSource, isSafeContent } from '@/api/news';

// The API modules import the Supabase client; these tests only cover pure helpers.
jest.mock('@/lib/supabase', () => ({ supabase: {} }));

describe('news filters', () => {
  it('recognises trusted sources', () => {
    expect(isFromTrustedSource('https://www.WHO.int/news/item/1')).toBe(true);
    expect(isFromTrustedSource('https://example.com/story')).toBe(false);
  });

  it('filters dangerous claims and horoscopes', () => {
    expect(isSafeContent('New screening guidelines', 'Doctors recommend…')).toBe(true);
    expect(isSafeContent('Miracle cure found', '')).toBe(false);
    expect(isSafeContent('Your Cancer horoscope', 'This week…')).toBe(false);
  });
});

describe('ilikeValue', () => {
  it('quotes search text so commas and parentheses cannot break the filter', () => {
    expect(ilikeValue('chemo, side effects (fatigue)')).toBe('"%chemo, side effects (fatigue)%"');
    expect(ilikeValue('say "hi"')).toBe('"%say \\"hi\\"%"');
  });
});
