// Redesign color tokens (docs/redesign/02-phase-2-foundations.md and the Foundations
// artboard). Lavender is the awareness color for all cancers; rose marks self-checks,
// teal marks help and calling. Every text pair passes WCAG AA (palette.test.ts).

export type Palette = {
  /** Screen background. */
  ground: string;
  /** Sections, sheets and the tab bar. */
  surface: string;
  /** Selected items, tips and icon tiles. */
  raised: string;
  /** Text. */
  ink: string;
  /** Secondary text. */
  muted: string;
  /** Dividers between rows. */
  line: string;
  /** Input, chip and secondary-button borders. */
  border: string;
  /** Primary buttons, links and the active tab. */
  action: string;
  onAction: string;
  /** The next-step panel and the welcome screen. */
  panel: string;
  onPanel: string;
  /** Secondary text on the panel. */
  onPanelMuted: string;
  /** Self-checks. */
  rose: string;
  roseTint: string;
  /** Help and calling. */
  help: string;
  helpTint: string;
  /** Text on `helpTint`. */
  onHelpTint: string;
  /** Milestones. */
  sun: string;
  sunInk: string;
  /** Pain bars in charts (3:1 against `surface`). */
  chartPain: string;
  /** Errors and destructive actions. */
  danger: string;
};

export const lightPalette: Palette = {
  ground: '#F6F4FA',
  surface: '#FFFFFF',
  raised: '#ECE7F8',
  ink: '#221A36',
  muted: '#5D5672',
  line: '#ECE7F8',
  border: '#D8D1EA',
  action: '#5236B5',
  onAction: '#FFFFFF',
  panel: '#2E1F66',
  onPanel: '#FFFFFF',
  onPanelMuted: '#E6E0FA',
  rose: '#C2255C',
  roseTint: '#FBE8EF',
  help: '#0E6B63',
  helpTint: '#E1F2EF',
  onHelpTint: '#0B4F49',
  sun: '#FDF1D6',
  sunInk: '#8A5A00',
  chartPain: '#DB5A88',
  danger: '#C2255C',
};

export const darkPalette: Palette = {
  ground: '#15111F',
  surface: '#1F1930',
  raised: '#2A2340',
  ink: '#EDE9F7',
  muted: '#A9A1BF',
  line: '#2A2340',
  border: '#3A3152',
  action: '#B4A3F5',
  onAction: '#15111F',
  panel: '#352578',
  onPanel: '#FFFFFF',
  onPanelMuted: '#E6E0FA',
  rose: '#F27BA6',
  roseTint: '#3A1A2A',
  help: '#6FD3C5',
  helpTint: '#0F3D39',
  onHelpTint: '#CFEDE8',
  sun: '#3A2E12',
  sunInk: '#F5BE4A',
  chartPain: '#F27BA6',
  danger: '#F27BA6',
};

/** Foreground/background pairs the design relies on, for the contrast test. */
export const TEXT_PAIRS: [fg: keyof Palette, bg: keyof Palette][] = [
  ['ink', 'ground'],
  ['ink', 'surface'],
  ['ink', 'raised'],
  ['muted', 'ground'],
  ['muted', 'surface'],
  ['muted', 'raised'],
  ['action', 'surface'],
  ['action', 'ground'],
  ['action', 'raised'],
  ['onAction', 'action'],
  ['onPanel', 'panel'],
  ['onPanelMuted', 'panel'],
  ['rose', 'surface'],
  ['rose', 'roseTint'],
  ['help', 'surface'],
  ['onHelpTint', 'helpTint'],
  ['sunInk', 'sun'],
  ['danger', 'surface'],
  ['danger', 'ground'],
  ['rose', 'ground'],
  ['help', 'ground'],
  ['muted', 'helpTint'],
  ['surface', 'help'],
  ['panel', 'onPanel'],
  ['ink', 'sun'],
];

/** Non-text marks (chart bars, switch tracks, borders that carry meaning): 3:1. */
export const MARK_PAIRS: [fg: keyof Palette, bg: keyof Palette][] = [
  ['chartPain', 'surface'],
  ['action', 'surface'],
  ['help', 'helpTint'],
  ['onAction', 'rose'],
  ['danger', 'raised'],
  ['sunInk', 'surface'],
  ['danger', 'roseTint'],
];
