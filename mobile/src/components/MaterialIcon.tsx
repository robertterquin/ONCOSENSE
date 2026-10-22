import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type MaterialIconProps = Omit<ComponentProps<typeof MaterialIcons>, 'name'> & {
  /** Flutter-style (`water_drop`) or React Native-style (`water-drop`) name. */
  name: string;
  /** Shown when `name` isn't a known icon. */
  fallback?: IconName;
};

const glyphs = MaterialIcons.glyphMap as Record<string, number>;

/**
 * Converts a Flutter icon name to the icon set's name. The set has no `_outlined` /
 * `_rounded` / `_sharp` variants for most icons, so those fall back to the base icon.
 */
export function resolveMaterialIconName(name: string): IconName | null {
  const converted = name.replace(/_/g, '-');
  if (converted in glyphs) return converted as IconName;
  const base = converted.replace(/-(outlined|rounded|sharp)$/, '');
  if (base in glyphs) return base as IconName;
  return null;
}

/**
 * Material icon by name. The database and models store Flutter icon names
 * (`water_drop`, `health_and_safety`); this converts them to the icon set's names.
 */
export function MaterialIcon({ name, fallback = 'help-outline', ...rest }: MaterialIconProps) {
  return <MaterialIcons name={resolveMaterialIconName(name) ?? fallback} {...rest} />;
}
