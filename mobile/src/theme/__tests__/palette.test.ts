import { contrastRatio } from '../contrast';
import {
  MARK_PAIRS,
  TEXT_PAIRS,
  darkPalette,
  highContrastDarkPalette,
  highContrastLightPalette,
  lightPalette,
  type Palette,
} from '../palette';

const themes: [string, Palette][] = [
  ['light', lightPalette],
  ['dark', darkPalette],
  ['highContrastLight', highContrastLightPalette],
  ['highContrastDark', highContrastDarkPalette],
];

const highContrastThemes: [string, Palette][] = [
  ['highContrastLight', highContrastLightPalette],
  ['highContrastDark', highContrastDarkPalette],
];

const AAA_TEXT_PAIRS: [fg: keyof Palette, bg: keyof Palette][] = [
  ['ink', 'ground'],
  ['ink', 'surface'],
  ['muted', 'ground'],
  ['muted', 'surface'],
];

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 1);
  });
});

describe.each(themes)('%s palette', (_name, palette) => {
  it.each(TEXT_PAIRS)('%s on %s meets AA for text (4.5:1)', (fg, bg) => {
    expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(MARK_PAIRS)('%s on %s meets 3:1 for marks', (fg, bg) => {
    expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(3);
  });
});

describe.each(highContrastThemes)('%s AAA compliance', (_name, palette) => {
  it.each(AAA_TEXT_PAIRS)('%s on %s meets AAA for primary text (7:1)', (fg, bg) => {
    expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(7);
  });
});
