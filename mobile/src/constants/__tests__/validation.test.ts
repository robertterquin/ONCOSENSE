import { getTipOfTheDay } from '@/api/healthTips';
import { HEALTH_TIPS } from '@/constants/healthTips';
import { DEFAULT_REMINDERS } from '@/constants/defaultReminders';
import {
  ageSchema,
  emailSchema,
  loginSchema,
  MESSAGES,
  nameSchema,
  passwordSchema,
  registerSchema,
} from '@/constants/validation';

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? null : result.error?.issues[0]?.message;

describe('validation (same rules and messages as Flutter)', () => {
  it('validates email', () => {
    expect(firstError(emailSchema.safeParse(''))).toBe(MESSAGES.emailEmpty);
    expect(firstError(emailSchema.safeParse('nope'))).toBe(MESSAGES.emailInvalid);
    expect(firstError(emailSchema.safeParse(' ana@example.com '))).toBeNull();
  });

  it('validates password and name length', () => {
    expect(firstError(passwordSchema.safeParse(''))).toBe(MESSAGES.passwordEmpty);
    expect(firstError(passwordSchema.safeParse('12345'))).toBe(MESSAGES.passwordShort);
    expect(firstError(passwordSchema.safeParse('123456'))).toBeNull();
    expect(firstError(nameSchema.safeParse('A'))).toBe(MESSAGES.nameShort);
  });

  it('treats age as optional but range-checked', () => {
    expect(firstError(ageSchema.safeParse(''))).toBeNull();
    expect(firstError(ageSchema.safeParse('abc'))).toBe('Please enter a valid age');
    expect(firstError(ageSchema.safeParse('12'))).toBe('Age must be between 13 and 120');
    expect(firstError(ageSchema.safeParse('45'))).toBeNull();
  });
});

describe('built-in data', () => {
  it('has all tips and reminders from the Flutter app', () => {
    expect(HEALTH_TIPS).toHaveLength(31);
    expect(DEFAULT_REMINDERS).toHaveLength(55);
    expect(new Set(DEFAULT_REMINDERS.map((r) => r.id)).size).toBe(55);
  });

  it('picks the same tip all day, changing daily', () => {
    const morning = getTipOfTheDay(new Date(2026, 0, 3, 8));
    expect(getTipOfTheDay(new Date(2026, 0, 3, 22))).toBe(morning);
    expect(morning).toBe(HEALTH_TIPS[2]);
    expect(getTipOfTheDay(new Date(2026, 0, 4, 8))).toBe(HEALTH_TIPS[3]);
  });
});

describe('form schemas', () => {
  const valid = {
    name: 'Ana Cruz',
    email: 'ana@example.com',
    password: 'Abcdefg1!',
    confirmPassword: 'Abcdefg1!',
    age: '',
    gender: null,
  };
  const errorFor = (form: object, field: string) => {
    const result = registerSchema.safeParse(form);
    return result.success
      ? null
      : (result.error.issues.find((issue) => issue.path[0] === field)?.message ?? null);
  };

  it('accepts a complete registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('applies the register password rules in order', () => {
    expect(errorFor({ ...valid, password: 'Abc1!' }, 'password')).toBe(
      'Password must be at least 8 characters',
    );
    expect(errorFor({ ...valid, password: 'Abcdefg1' }, 'password')).toBe(
      'Password must contain at least one special character',
    );
  });

  it('reports a mismatch even while other fields are invalid', () => {
    expect(
      errorFor(
        { ...valid, name: '', password: 'Abcdefg1', confirmPassword: 'Abcdefg2' },
        'confirmPassword',
      ),
    ).toBe(MESSAGES.passwordMismatch);
    expect(errorFor({ ...valid, confirmPassword: '' }, 'confirmPassword')).toBe(
      'Please confirm your password',
    );
  });

  it('only requires a non-empty password to log in', () => {
    expect(loginSchema.safeParse({ email: 'ana@example.com', password: 'x' }).success).toBe(true);
  });
});
