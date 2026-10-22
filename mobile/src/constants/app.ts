// Ported from lib/utils/constants.dart. Spacing, radius and durations live in src/theme/tokens.ts.

export const APP_NAME = 'OncoSense';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Empowering Awareness. Saving Lives.';

export const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;

/** Health reminder frequencies, in hours. */
export const REMINDER_FREQUENCY = {
  hourly: 1,
  everyTwoHours: 2,
  everyThreeHours: 3,
  everyFourHours: 4,
  everySixHours: 6,
  everyEightHours: 8,
  everyTwelveHours: 12,
  daily: 24,
  everyTwoDays: 48,
  everyThreeDays: 72,
  weekly: 168,
  monthly: 720,
} as const;

/** API and query limits. */
export const DATA_LIMITS = {
  /** Max reminders to fetch from the database. */
  healthRemindersLimit: 100,
  /** Reminders shown on Home. */
  healthRemindersToShow: 2,
  /** Articles on the Home screen. */
  newsArticlesDefault: 10,
  /** Max articles requested from the news function. */
  newsArticlesMax: 30,
  survivorStoryCount: 1,
  /** Articles in the Home carousel. */
  newsArticlesCarousel: 5,
  maxQueryResults: 50,
  minQueryResults: 1,
} as const;
