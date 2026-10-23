import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';
import { MaterialIcon } from './MaterialIcon';

type InfoDialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Material icon name shown in a tinted circle before the title. */
  icon: string;
  iconColor: string;
  iconBackground: string;
  children: ReactNode;
};

/** Read-only dialog with a Close button (Help & Support, About). */
export function InfoDialog({
  visible,
  onClose,
  title,
  icon,
  iconColor,
  iconBackground,
  children,
}: InfoDialogProps) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <View style={styles.titleRow}>
            <View style={[styles.icon, { backgroundColor: iconBackground }]}>
              <MaterialIcon name={icon} size={20} color={iconColor} />
            </View>
            <AppText variant="titleLarge">{title}</AppText>
          </View>
          <View style={styles.content}>{children}</View>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
            <AppText variant="label" color={brand.headerPink}>
              Close
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: { width: '100%', maxWidth: 420, borderRadius: radius.large, padding: 24, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { padding: 8, borderRadius: 10 },
  content: { gap: 10 },
  close: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 },
});
