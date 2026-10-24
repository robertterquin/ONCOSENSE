import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { userDisplayName } from '@/api/auth';
import { LoadingState } from '@/components/StateViews';
import {
  Banner,
  BottomActionBar,
  Button,
  ListRow,
  Screen,
  Section,
  SegmentedControl,
  Switch,
  Text,
} from '@/components/ui';
import { useFocus } from '@/hooks/useFocus';
import { useAppointments, useJourneyEntries, useTreatments } from '@/hooks/useJourney';
import { buildSummary, summaryHtml, summarySections } from '@/lib/summary';
import { useUser } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';

// "Share a summary with my doctor" (redesign Phase 4). The preview shows exactly what
// goes into the PDF before the share sheet (or, on the web, the print dialog) opens.

const close = () => (router.canGoBack() ? router.back() : router.replace('/journey'));

type Range = '30' | '90';

export default function SummaryScreen() {
  const user = useUser();
  const focus = useFocus();
  const entries = useJourneyEntries();
  const treatments = useTreatments();
  const appointments = useAppointments();
  const [range, setRange] = useState<Range>('30');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [sharing, setSharing] = useState(false);

  // `isLoading`: a query switched off (appointments with no account) never stops pending.
  if (entries.isLoading || treatments.isLoading || appointments.isLoading) {
    return (
      <Screen back={{ label: 'Journey', onPress: close }}>
        <LoadingState message="Getting your check-ins" />
      </Screen>
    );
  }

  const summary = buildSummary({
    name: userDisplayName(user),
    focus,
    days: Number(range),
    now: new Date(),
    entries: entries.data ?? [],
    treatments: treatments.data ?? [],
    appointments: appointments.data ?? [],
    includeNotes,
  });
  const sections = summarySections(summary);
  const notesAvailable = (entries.data ?? []).some((entry) => entry.notes);

  const share = async () => {
    setSharing(true);
    try {
      const html = summaryHtml(summary);
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        showToast("Sharing isn't available on this device.", 'error');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Share your summary',
      });
    } catch (error) {
      showToast(`Couldn't make the PDF: ${(error as Error).message}`, 'error');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Screen
      back={{ label: 'Journey', onPress: close }}
      title="Summary for your doctor"
      subtitle="A short PDF you can send or print. Nothing is shared until you choose where."
      bottomBar={
        <BottomActionBar>
          <Button
            title={Platform.OS === 'web' ? 'Print or save as PDF' : 'Share PDF'}
            icon="share"
            loading={sharing}
            onPress={share}
          />
        </BottomActionBar>
      }>
      <SegmentedControl<Range>
        accessibilityLabel="Time period"
        value={range}
        onChange={setRange}
        options={[
          { value: '30', label: 'Last 30 days' },
          { value: '90', label: 'Last 90 days' },
        ]}
      />
      {notesAvailable ? (
        <Section divided={false}>
          <ListRow
            title="Include my notes"
            subtitle="Notes can be personal; leave this off to keep them private"
            accessory={
              <Switch
                accessibilityLabel="Include my notes"
                value={includeNotes}
                onValueChange={setIncludeNotes}
              />
            }
          />
        </Section>
      ) : null}

      <Banner tone="info" title="What will be shared">
        Exactly the text below, nothing else from the app.
      </Banner>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text variant="strong" accessibilityRole="header">
            {section.title}
          </Text>
          {section.lines.map((line, index) => (
            <Text key={index} variant="body">
              {line}
            </Text>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.xs },
});
