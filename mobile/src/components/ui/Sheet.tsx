import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

import { Button } from './Button';
import { Text } from './Text';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** A bottom sheet over a dimmed screen: details for one item, closed with a button or the backdrop. */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const { palette } = useDesign();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { backgroundColor: palette.surface, paddingBottom: insets.bottom + space.lg },
          ]}>
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
          <ScrollView contentContainerStyle={styles.content}>
            <Text variant="heading" accessibilityRole="header">
              {title}
            </Text>
            {children}
          </ScrollView>
          <View style={styles.footer}>
            <Button title="Close" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(21, 17, 31, 0.5)' },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: radii.panel,
    borderTopRightRadius: radii.panel,
    paddingTop: space.sm,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: radii.round },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.md },
  footer: { paddingHorizontal: space.xl, paddingTop: space.md },
});
