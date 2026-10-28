import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { userDisplayName } from '@/api/auth';
import {
  Banner,
  BottomActionBar,
  Button,
  IconButton,
  ListRow,
  LoadingState,
  Screen,
  Section,
  SegmentedControl,
  StatTile,
  Switch,
  Text,
  TextField,
} from '@/components/ui';
import { useBookmarkedQuestions } from '@/hooks/useBookmarks';
import { useFocus } from '@/hooks/useFocus';
import { useAppointments, useJourneyEntries, useTreatments } from '@/hooks/useJourney';
import { haptics } from '@/lib/haptics';
import { buildSummary, summaryHtml, summarySections } from '@/lib/summary';
import { useUser } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

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
  const bookmarkedQuestions = useBookmarkedQuestions();
  const { palette } = useDesign();

  const [range, setRange] = useState<Range>('30');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);

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
    questions,
  });
  const sections = summarySections(summary);
  const notesAvailable = (entries.data ?? []).some((entry) => entry.notes);

  const addQuestion = () => {
    const trimmed = questionInput.trim();
    if (!trimmed) return;
    if (!questions.includes(trimmed)) {
      setQuestions((prev) => [...prev, trimmed]);
      haptics.lightImpact();
    }
    setQuestionInput('');
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    haptics.selection();
  };

  const importSavedQuestions = () => {
    const saved = (bookmarkedQuestions.data ?? []).map((q) => q.title);
    if (!saved.length) {
      showToast('No saved community questions to import.');
      return;
    }
    const merged = Array.from(new Set([...questions, ...saved]));
    setQuestions(merged);
    showToast(`Added ${saved.length} question${saved.length === 1 ? '' : 's'}`);
    haptics.success();
  };

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
      subtitle="A standardized clinical PDF you can send or print. Nothing is shared until you choose where."
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

      {summary.averages ? (
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatTile
              label="Average Pain"
              value={`${summary.averages.pain}`}
              detail={summary.trend ? `Trend: ${summary.trend.pain}` : 'out of 10'}
              valueTone={summary.trend?.pain === 'worse' ? 'danger' : 'ink'}
            />
            <StatTile
              label="Average Energy"
              value={`${summary.averages.energy}`}
              detail={summary.trend ? `Trend: ${summary.trend.energy}` : 'out of 10'}
              valueTone={summary.trend?.energy === 'better' ? 'help' : 'ink'}
            />
          </View>
          <View style={styles.statsRow}>
            <StatTile
              label="Sleep Quality"
              value={`${summary.averages.sleep}`}
              detail="out of 5 average"
              valueTone="action"
            />
            <StatTile
              label="Overall Mood"
              value={`${summary.averages.mood}`}
              detail="out of 5 average"
              valueTone="action"
            />
          </View>
        </View>
      ) : null}

      <Section
        title="Questions for your doctor"
        subtitle="Bring questions to your appointment so you don't forget">
        <View style={styles.questionInputRow}>
          <View style={styles.questionInputField}>
            <TextField
              label="New question"
              placeholder="e.g. Ask about fatigue medication"
              value={questionInput}
              onChangeText={setQuestionInput}
              onSubmitEditing={addQuestion}
              returnKeyType="done"
            />
          </View>
          <Button
            title="Add"
            variant="secondary"
            fullWidth={false}
            onPress={addQuestion}
            style={styles.addBtn}
          />
        </View>

        {bookmarkedQuestions.data?.length ? (
          <Button
            title={`Import saved questions (${bookmarkedQuestions.data.length})`}
            icon="bookmark"
            variant="quiet"
            fullWidth={false}
            onPress={importSavedQuestions}
          />
        ) : null}

        {questions.length ? (
          <View style={styles.questionsList}>
            {questions.map((q, idx) => (
              <View
                key={idx}
                style={[
                  styles.questionChip,
                  { backgroundColor: palette.raised, borderColor: palette.line },
                ]}>
                <Text variant="body" style={styles.questionText}>
                  {q}
                </Text>
                <IconButton
                  icon="trash"
                  accessibilityLabel={`Remove question ${q}`}
                  onPress={() => removeQuestion(idx)}
                />
              </View>
            ))}
          </View>
        ) : null}
      </Section>

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

      <Banner tone="info" title="What will be shared in the PDF">
        Standard clinical report formatted for quick review by your care team.
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
  statsGrid: { gap: space.sm },
  statsRow: { flexDirection: 'row', gap: space.sm },
  questionInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
  },
  questionInputField: {
    flex: 1,
  },
  addBtn: {
    marginBottom: space.xs,
  },
  questionsList: {
    gap: space.xs,
    marginTop: space.xs,
  },
  questionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: space.md,
    paddingRight: space.xs,
    paddingVertical: space.xs,
    borderRadius: radii.control,
    borderWidth: 1,
  },
  questionText: {
    flex: 1,
    marginRight: space.sm,
  },
});
