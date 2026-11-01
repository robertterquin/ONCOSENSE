import { contrastRatio } from '../contrast';
import { TONAL_CONTRAST } from '../elevation';
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

// Card fills sit within a few percent of the page, so the `border` edge is what makes a
// card visible (theme/elevation.ts). Keep it clearly distinct from the page and the card.
describe.each(themes)('%s card edges', (_name, palette) => {
  it('border stands out from the page and the card', () => {
    expect(contrastRatio(palette.border, palette.ground)).toBeGreaterThanOrEqual(1.3);
    expect(contrastRatio(palette.border, palette.surface)).toBeGreaterThanOrEqual(1.3);
  });
});

// Dividers sit on cards; at 1 pt they need this much contrast to show on every screen.
describe.each(themes)('%s dividers', (_name, palette) => {
  it('line stands out from the card', () => {
    expect(contrastRatio(palette.line, palette.surface)).toBeGreaterThanOrEqual(1.35);
  });
});

// Cards drop their outline in light and dark (theme/elevation.ts), so tone alone has to
// separate them from the page.
it.each([
  ['light', lightPalette],
  ['dark', darkPalette],
])('%s cards are a clear step off the page', (_name, palette) => {
  expect(contrastRatio(palette.surface, palette.ground)).toBeGreaterThanOrEqual(TONAL_CONTRAST);
});
