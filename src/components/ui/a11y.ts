import { Platform } from 'react-native';

/**
 * Props that hide a decorative element (an icon, the ribbon) from screen readers.
 * SVG elements reach the DOM on the web, which only understands `aria-hidden`.
 */
export const decorative =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      } as const);
