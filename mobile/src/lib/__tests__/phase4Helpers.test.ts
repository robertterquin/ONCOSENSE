import { awarenessForMonth } from '@/constants/awareness';
import { askQuestionSchema } from '@/constants/validation';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

describe('home helpers', () => {
  it('picks the awareness month', () => {
    expect(awarenessForMonth(new Date(2026, 9, 1)).title).toBe('Breast Cancer');
    expect(awarenessForMonth(new Date(2026, 0, 31)).month).toBe('January');
  });
});

describe('askQuestionSchema', () => {
  const base = { category: 'Symptoms', isAnonymous: false };
  const firstError = (form: object) => {
    const result = askQuestionSchema.safeParse({ ...base, ...form });
    return result.success ? null : result.error.issues.map((issue) => issue.message);
  };

  it('requires a 10+ character title and 20+ character details', () => {
    expect(firstError({ title: '', content: '' })).toEqual([
      'Please enter a title',
      'Title must be at least 10 characters',
      'Please provide details',
      'Details must be at least 20 characters',
    ]);
    expect(firstError({ title: 'Short one', content: 'x'.repeat(20) })).toEqual([
      'Title must be at least 10 characters',
    ]);
    expect(
      firstError({ title: 'A good question?', content: 'Enough detail to help others.' }),
    ).toBeNull();
  });
});
