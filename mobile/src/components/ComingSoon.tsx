import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from './AppHeader';
import { Screen } from './Screen';
import { EmptyState } from './StateViews';

type ComingSoonProps = {
  title: string;
  subtitle: string;
  /** Migration phase that builds this screen. */
  phase: number;
  /** Material icon name. */
  icon: string;
  children?: ReactNode;
};

/** Temporary tab content until the screen is ported. */
export function ComingSoon({ title, subtitle, phase, icon, children }: ComingSoonProps) {
  return (
    <Screen header={<AppHeader title={title} subtitle={subtitle} />}>
      <EmptyState
        icon={icon}
        title={`${title} is coming soon`}
        message={`This screen is being rebuilt in migration Phase ${phase}.`}
      />
      {children}
      <View style={styles.tabBarSpace} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Keeps content clear of the floating tab bar.
  tabBarSpace: {
    height: 110,
  },
});
