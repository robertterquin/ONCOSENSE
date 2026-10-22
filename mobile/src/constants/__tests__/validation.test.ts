import { getTipOfTheDay } from '@/api/healthTips';
import { HEALTH_TIPS } from '@/constants/healthTips';
import { DEFAULT_REMINDERS } from '@/constants/defaultReminders';
import {
  ageSchema,
  emailSchema,
  MESSAGES,
  nameSchema,
  passwordSchema,
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
