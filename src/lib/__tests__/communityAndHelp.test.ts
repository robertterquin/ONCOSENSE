import { CRISIS_LINE } from '@/constants/crisis';
import { initials, questionMeta } from '@/lib/community';
import { callLabel, HELP_SECTIONS, isNear, matchesResource, regionFor } from '@/lib/help';
import { FORUM_CATEGORIES } from '@/types/question';

describe('regions for the Near filter', () => {
  it('maps the locations in the resources table', () => {
    expect(regionFor('Metro Manila')).toBe('Metro Manila');
    expect(regionFor('Quezon City')).toBe('Metro Manila');
    expect(regionFor('Manila')).toBe('Metro Manila');
    expect(regionFor('Pampanga')).toBe('Central Luzon');
    expect(regionFor('Cebu City')).toBe('Cebu');
    expect(regionFor('Davao City')).toBe('Davao');
    expect(regionFor('Philippines')).toBe('Nationwide');
    expect(regionFor('Online & Local')).toBe('Online');
    expect(regionFor('Iloilo')).toBeNull();
    expect(regionFor(null)).toBeNull();
  });

  it('shows nationwide and online help everywhere, and unknown places only for all', () => {
    expect(isNear({ location: 'Cebu City' }, 'Cebu')).toBe(true);
    expect(isNear({ location: 'Cebu City' }, 'Davao')).toBe(false);
    expect(isNear({ location: 'Philippines' }, 'Davao')).toBe(true);
    expect(isNear({ location: 'Online' }, 'Metro Manila')).toBe(true);
    expect(isNear({ location: 'Iloilo' }, 'Cebu')).toBe(false);
    expect(isNear({ location: 'Iloilo' }, null)).toBe(true);
  });

  it('opens screening centers from Learn', () => {
    expect(HELP_SECTIONS.find((s) => s.key === 'screening')?.type).toBe('screening_center');
  });
});

describe('crisis line', () => {
  it('stays the NCMH Crisis Hotline, dialable as written', () => {
    expect(CRISIS_LINE.display).toBe('0917-899-8727');
    expect(CRISIS_LINE.dial).toBe(CRISIS_LINE.display.replace(/\D/g, ''));
    expect(CRISIS_LINE.name).toContain('NCMH');
  });

  it('gives call buttons a full label', () => {
    expect(callLabel({ name: 'Philippine Cancer Society', phone: '(02) 8508-7777' })).toBe(
      'Call Philippine Cancer Society, (02) 8508-7777',
    );
  });
});

describe('question rows', () => {
  const now = new Date(2026, 9, 24, 14, 0);
  it('says answers, helpful count and time', () => {
    expect(
      questionMeta({ answerCount: 3, upvotes: 5, createdAt: new Date(2026, 9, 24, 12, 0) }, now),
    ).toBe('3 answers · 5 found this helpful · 2 hours ago');
    expect(
      questionMeta(
        { answerCount: 1, upvotes: 0, createdAt: new Date(2026, 9, 24, 13, 59, 30) },
        now,
      ),
    ).toBe('1 answer · Just now');
    expect(
      questionMeta({ answerCount: 0, upvotes: 1, createdAt: new Date(2026, 9, 20) }, now),
    ).toBe('No answers yet · 1 found this helpful · 4 days ago');
  });

  it('has the redesign topics', () => {
    expect(FORUM_CATEGORIES).toEqual([
      'Symptoms',
      'Diagnosis',
      'Treatment',
      'Mental Health',
      'Lifestyle',
      'Family Support',
    ]);
  });

  it('makes initials', () => {
    expect(initials('Ana Reyes')).toBe('AR');
    expect(initials('  ana ')).toBe('A');
    expect(initials(null)).toBe('?');
  });
});

describe('matchesResource', () => {
  const doh = {
    name: 'Department of Health',
    location: 'Philippines',
    phone: '1555',
    description: 'National health hotline',
  };
  it('matches every typed word against name, place, number and description', () => {
    expect(matchesResource(doh, 'health 1555')).toBe(true);
    expect(matchesResource(doh, '  DEPARTMENT  ')).toBe(true);
    expect(matchesResource(doh, 'health cebu')).toBe(false);
  });
});
