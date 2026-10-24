import { Sheet, Text } from '@/components/ui';
import { CREDITS, MEDICAL_DISCLAIMER, PRIVACY_POLICY, TERMS_OF_SERVICE } from '@/constants/legal';

// Terms, privacy, the medical disclaimer and credits, shown in a sheet.

export const LEGAL = {
  'Medical disclaimer': MEDICAL_DISCLAIMER,
  'Terms of service': TERMS_OF_SERVICE,
  'Privacy policy': PRIVACY_POLICY,
  Credits: CREDITS,
} as const;

export type LegalTitle = keyof typeof LEGAL;

export function LegalSheet({ open, onClose }: { open: LegalTitle | null; onClose: () => void }) {
  return (
    <Sheet visible={open !== null} onClose={onClose} title={open ?? ''}>
      <Text variant="reading">{open ? LEGAL[open] : ''}</Text>
    </Sheet>
  );
}
