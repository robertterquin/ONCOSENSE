import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type MaterialIconProps = Omit<ComponentProps<typeof MaterialIcons>, 'name'> & {
  /** Flutter-style (`water_drop`) or React Native-style (`water-drop`) name. */
  name: string;
  /** Shown when `name` isn't a known icon. */
  fallback?: IconName;
};

/**
 * Material icon by name. The database and models store Flutter icon names
 * (`water_drop`, `health_and_safety`); this converts them to the icon set's names.
 */
export function MaterialIcon({ name, fallback = 'help-outline', ...rest }: MaterialIconProps) {
  const converted = name.replace(/_/g, '-');
  const iconName = converted in MaterialIcons.glyphMap ? (converted as IconName) : fallback;
  return <MaterialIcons name={iconName} {...rest} />;
}
