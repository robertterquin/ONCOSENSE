import { z } from 'zod';

// Rules and messages ported from lib/utils/constants.dart.

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NAME_LENGTH = 2;
export const MIN_AGE = 13;
export const MAX_AGE = 120;

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const MESSAGES = {
  emailEmpty: 'Please enter your email',
  emailInvalid: 'Please enter a valid email',
  passwordEmpty: 'Please enter your password',
  passwordShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  passwordMismatch: 'Passwords do not match',
  nameEmpty: 'Please enter your name',
  nameShort: `Name must be at least ${MIN_NAME_LENGTH} characters`,
  termsNotAccepted: 'Please accept the terms and conditions',
  registrationSuccess: 'Account created successfully!',
  loginSuccess: 'Welcome back!',
  passwordResetEmailSent: 'Password reset link sent to your email',
} as const;

export const emailSchema = z
  .string()
  .trim()
  .min(1, MESSAGES.emailEmpty)
  .regex(EMAIL_PATTERN, MESSAGES.emailInvalid);

export const passwordSchema = z
  .string()
  .min(1, MESSAGES.passwordEmpty)
  .min(MIN_PASSWORD_LENGTH, MESSAGES.passwordShort);

export const nameSchema = z
  .string()
  .trim()
  .min(1, MESSAGES.nameEmpty)
  .min(MIN_NAME_LENGTH, MESSAGES.nameShort);

const AGE_RANGE_MESSAGE = `Age must be between ${MIN_AGE} and ${MAX_AGE}`;

/** Optional: an empty field is allowed (same as the Flutter register screen). */
export const ageSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^[+-]?\d+$/.test(value), 'Please enter a valid age')
  .refine((value) => {
    if (value === '') return true;
    const age = Number(value);
    return age >= MIN_AGE && age <= MAX_AGE;
  }, AGE_RANGE_MESSAGE);

/** Rules for new passwords, shown as a checklist on the register screen (same as Flutter). */
export const PASSWORD_REQUIREMENTS = [
  {
    label: 'At least 8 characters',
    message: 'Password must be at least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'One uppercase letter',
    message: 'Password must contain at least one uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: 'One lowercase letter',
    message: 'Password must contain at least one lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: 'One number',
    message: 'Password must contain at least one number',
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: 'One special character',
    message: 'Password must contain at least one special character',
    test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
] as const;

export const newPasswordSchema = z
  .string()
  .min(1, MESSAGES.passwordEmpty)
  .superRefine((password, ctx) => {
    if (!password) return;
    const failed = PASSWORD_REQUIREMENTS.find((rule) => !rule.test(password));
    if (failed) ctx.addIssue({ code: 'custom', message: failed.message });
  });

// ---- Form schemas ----

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, MESSAGES.passwordEmpty),
});
export type LoginForm = z.input<typeof loginSchema>;

const registerFields = z.object({
  name: nameSchema,
  email: emailSchema,
  password: newPasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  age: ageSchema,
  gender: z.string().nullable(),
});

export const registerSchema = registerFields.refine(
  (form) => form.password === form.confirmPassword,
  {
    path: ['confirmPassword'],
    message: MESSAGES.passwordMismatch,
    // Check the match whenever a confirmation was typed, even while other fields
    // (including the password's own rules) still have errors — like Flutter.
    when: (payload) => {
      const { password, confirmPassword } = payload.value as Record<string, unknown>;
      return (
        typeof password === 'string' && typeof confirmPassword === 'string' && !!confirmPassword
      );
    },
  },
);
export type RegisterForm = z.input<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordForm = z.input<typeof forgotPasswordSchema>;
