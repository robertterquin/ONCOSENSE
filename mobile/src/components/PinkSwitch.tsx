import { Switch } from 'react-native';

import { brand } from '@/theme/colors';

type PinkSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

/** On/off switch in the app's pink (Flutter's `activeColor: Color(0xFFD81B60)`). */
export function PinkSwitch({ value, onValueChange, accessibilityLabel }: PinkSwitchProps) {
  return (
    <Switch
      accessibilityLabel={accessibilityLabel}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: brand.mediumPink }}
      thumbColor={value ? brand.headerPink : undefined}
      // React Native Web ignores thumbColor when on and uses its own teal default.
      {...({ activeThumbColor: brand.headerPink } as object)}
    />
  );
}
