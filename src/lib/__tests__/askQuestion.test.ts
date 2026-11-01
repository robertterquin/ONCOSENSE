import { askQuestionSchema } from '@/constants/validation';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

describe('askQuestionSchema', () => {
  const base = { category: 'Symptoms', cancerTypeId: 'none', isAnonymous: false };
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
