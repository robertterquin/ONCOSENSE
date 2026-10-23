import { changePasswordSchema, editProfileSchema } from '@/constants/validation';
import { formatLongDate } from '@/lib/dates';
import { energyColor, energyLabel, painColor, painLabel } from '@/lib/journeyLabels';

describe('journey slider labels (same as Flutter)', () => {
  it('describes pain levels', () => {
    expect(painLabel(0)).toBe('No pain');
    expect(painLabel(2)).toBe('2/10 (Mild)');
    expect(painLabel(6)).toBe('6/10 (Significant)');
    expect(painLabel(10)).toBe('10/10 (Extreme)');
    expect(painColor(1)).toBe('#4CAF50');
    expect(painColor(9)).toBe('#F44336');
  });

  it('describes energy levels', () => {
    expect(energyLabel(1)).toBe('1/10 (Exhausted)');
    expect(energyLabel(8)).toBe('8/10 (Energized)');
    expect(energyLabel(10)).toBe('10/10 (Full Energy)');
    expect(energyColor(2)).toBe('#F44336');
    expect(energyColor(10)).toBe('#4CAF50');
  });

  it('formats long dates', () => {
    expect(formatLongDate(new Date(2026, 6, 25))).toBe('July 25, 2026');
  });
});

describe('editProfileSchema', () => {
  const firstError = (form: object) => {
    const result = editProfileSchema.safeParse({ fullName: 'Ana', age: '', gender: null, ...form });
    return result.success ? null : result.error.issues[0].message;
  };

  it('requires a name and allows ages 1–150', () => {
    expect(firstError({})).toBeNull();
    expect(firstError({ fullName: '  ' })).toBe('Please enter your name');
    expect(firstError({ age: '150' })).toBeNull();
    expect(firstError({ age: '0' })).toBe('Please enter a valid age');
    expect(firstError({ age: 'abc' })).toBe('Please enter a valid age');
  });
});

describe('changePasswordSchema', () => {
  const valid = {
    email: 'ana@example.com',
    currentPassword: 'old',
    newPassword: 'Newpass1!',
    confirmPassword: 'Newpass1!',
  };
  const errors = (form: object) => {
    const result = changePasswordSchema.safeParse({ ...valid, ...form });
    return result.success ? [] : result.error.issues.map((issue) => issue.message);
  };

  it('accepts a valid change', () => {
    expect(errors({})).toEqual([]);
  });

  it('requires the current password and the new-password rules', () => {
    expect(errors({ currentPassword: '' })).toContain('Current password is required');
    expect(errors({ newPassword: 'short', confirmPassword: 'short' })).toContain(
      'Password must be at least 8 characters',
    );
    expect(errors({ confirmPassword: 'Different1!' })).toContain('Passwords do not match');
  });
});
