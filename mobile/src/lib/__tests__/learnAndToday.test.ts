import { awarenessForMonth } from '@/constants/awareness';
import { cancerForAwareness, guideForCancer, searchLearn } from '@/lib/learn';
import { firstName, formatTodayDate, greeting } from '@/lib/today';
import type { CancerType } from '@/types/cancerType';
import type { PreventionTip } from '@/types/preventionTip';
import type { SelfCheckGuide } from '@/types/selfCheckGuide';

const cancer = (name: string, symptoms: string[] = []) =>
  ({ id: name, name, description: '', symptoms }) as unknown as CancerType;
const guide = (cancerType: string, title = `${cancerType} check`) =>
  ({ id: cancerType, cancerType, title, description: '' }) as unknown as SelfCheckGuide;
const tip = (title: string) =>
  ({ id: title, title, description: '', category: 'Lifestyle' }) as unknown as PreventionTip;

const cancers = [cancer('Breast Cancer', ['A lump']), cancer('Leukemia'), cancer('Skin Cancer')];
const guides = [guide('Breast'), guide('Leukemia'), guide('Testicular')];

describe('Learn links', () => {
  it('pairs cancer types with their self-checks', () => {
    expect(guideForCancer(guides, cancers[0])?.cancerType).toBe('Breast');
    expect(guideForCancer(guides, cancers[1])?.cancerType).toBe('Leukemia');
    expect(guideForCancer(guides, cancers[2])).toBeNull();
  });

  it("links October's awareness month to breast cancer", () => {
    const october = awarenessForMonth(new Date(2026, 9, 24));
    expect(cancerForAwareness(cancers, october.title)?.name).toBe('Breast Cancer');
    expect(cancerForAwareness(cancers, awarenessForMonth(new Date(2026, 1, 1)).title)).toBeNull();
  });
});

describe('searchLearn', () => {
  const lists = { cancers, guides, tips: [tip('Stay active'), tip('Protect your skin')] };

  it('searches names and signs across all three lists', () => {
    const lump = searchLearn(lists, ' LUMP ');
    expect(lump.cancers.map((c) => c.name)).toEqual(['Breast Cancer']);
    expect(lump.guides).toEqual([]);
    const skin = searchLearn(lists, 'skin');
    expect(skin.cancers.map((c) => c.name)).toEqual(['Skin Cancer']);
    expect(skin.tips.map((t) => t.title)).toEqual(['Protect your skin']);
  });

  it('returns everything for an empty search', () => {
    expect(searchLearn(lists, '  ')).toBe(lists);
  });
});

describe('Today header', () => {
  it('greets by time of day, and says hello to guests', () => {
    expect(greeting(new Date(2026, 9, 24, 8), 'Ana')).toBe('Good morning, Ana');
    expect(greeting(new Date(2026, 9, 24, 12), 'Ana')).toBe('Good afternoon, Ana');
    expect(greeting(new Date(2026, 9, 24, 19), 'Ana')).toBe('Good evening, Ana');
    expect(greeting(new Date(2026, 9, 24, 8), null)).toBe('Hello');
  });

  it('shows the date and the first name', () => {
    expect(formatTodayDate(new Date(2026, 9, 24))).toBe('Saturday, October 24');
    expect(firstName('  Ana  Reyes ')).toBe('Ana');
  });
});
