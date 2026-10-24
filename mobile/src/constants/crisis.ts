// The crisis line shown at the top of Help (redesign Phase 5). Kept here, not only in
// the `resources` table, so it can't disappear if that row is edited or removed.

export const CRISIS_LINE = {
  name: 'NCMH Crisis Hotline',
  /** As written for people. */
  display: '0917-899-8727',
  /** What the phone dials. */
  dial: '09178998727',
} as const;
