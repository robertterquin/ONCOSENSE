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
