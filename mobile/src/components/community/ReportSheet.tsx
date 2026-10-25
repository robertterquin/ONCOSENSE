import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, Sheet, Text, TextField } from '@/components/ui';
import { space } from '@/theme/tokens';

// "Report" for a question or answer (redesign Phase 5): pick a reason, optionally
// add details. Reports go to the moderators, not the author.

const REASONS = [
  'Spam or misleading',
  'Inappropriate content',
  'Harmful medical advice',
  'Harassment or hate speech',
  'Other',
];

type ReportSheetProps = {
  visible: boolean;
  /** "question" or "answer", for the title. */
  what: string;
  onCancel: () => void;
  onSubmit: (report: { reason: string; additionalInfo: string }) => void;
};

export function ReportSheet({ visible, what, onCancel, onSubmit }: ReportSheetProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const reset = () => {
    setReason(null);
    setDetails('');
  };
  const close = () => {
    reset();
    onCancel();
  };

  return (
    <Sheet visible={visible} onClose={close} title={`Report this ${what}`}>
      <Text variant="body" tone="muted">
        Our moderators review every report. The person who posted it won&apos;t see who reported it.
      </Text>
      <View style={styles.reasons} accessibilityRole="radiogroup" accessibilityLabel="Reason">
        {REASONS.map((option) => (
          <Chip
            key={option}
            kind="radio"
            label={option}
            selected={reason === option}
            onPress={() => setReason(option)}
          />
        ))}
      </View>
      <TextField
        label="Anything else? (optional)"
        multiline
        value={details}
        onChangeText={setDetails}
        maxLength={500}
      />
      <Button
        title="Send report"
        variant="destructive"
        disabled={!reason}
        onPress={() => {
          onSubmit({ reason: reason!, additionalInfo: details.trim() });
          reset();
        }}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
