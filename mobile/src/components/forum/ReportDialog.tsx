import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

const REASONS = [
  'Spam or misleading',
  'Inappropriate content',
  'Harmful medical advice',
  'Harassment or hate speech',
  'Other',
];

type ReportDialogProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (report: { reason: string; additionalInfo: string }) => void;
};

/** "Report Question" dialog: pick a reason, optionally add details. */
export function ReportDialog({ visible, onCancel, onSubmit }: ReportDialogProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const close = () => {
    setReason(null);
    setDetails('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <AppText variant="titleLarge">Report Question</AppText>
          <AppText>Why are you reporting this?</AppText>
          <View accessibilityRole="radiogroup">
            {REASONS.map((option) => {
              const selected = reason === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setReason(option)}
                  style={styles.option}>
                  <MaterialIcon
                    name={selected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    size={22}
                    color={selected ? brand.headerPink : colors.textSecondary}
                  />
                  <AppText>{option}</AppText>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            accessibilityLabel="Additional information (optional)"
            placeholder="Additional information (optional)"
            placeholderTextColor={colors.inputPlaceholder}
            value={details}
            onChangeText={setDetails}
            multiline
            style={[styles.input, { color: colors.text, borderColor: colors.divider }]}
          />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={close} style={styles.action}>
              <AppText variant="label" color={brand.headerPink}>
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !reason }}
              disabled={!reason}
              onPress={() => {
                onSubmit({ reason: reason!, additionalInfo: details.trim() });
                setReason(null);
                setDetails('');
              }}
              style={[styles.action, styles.report, !reason && styles.disabled]}>
              <AppText variant="label" color={brand.white}>
                Report
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.large,
    padding: 24,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: radius.small,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  action: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.small,
  },
  report: {
    backgroundColor: brand.headerPink,
  },
  disabled: {
    opacity: 0.4,
  },
});
