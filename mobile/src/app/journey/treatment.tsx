import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { newJourneyId } from '@/api/journey';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { ChipSelect, FormBox, FormSection } from '@/components/journey/FormSection';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { useSaveTreatment } from '@/hooks/useJourney';
import { addDays, formatShortDate } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { treatmentTypeLabel, type TreatmentType } from '@/types/treatment';

// Port of lib/screens/journey/add_treatment_screen.dart

const TYPE_OPTIONS: { type: TreatmentType; icon: string; color: string }[] = [
  { type: 'chemotherapy', icon: 'science', color: '#9C27B0' },
  { type: 'radiation', icon: 'bolt', color: '#FF9800' },
  { type: 'surgery', icon: 'medical_services', color: '#F44336' },
  { type: 'immunotherapy', icon: 'shield', color: '#2196F3' },
  { type: 'hormoneTherapy', icon: 'medication', color: '#009688' },
  { type: 'targetedTherapy', icon: 'gps_fixed', color: '#3F51B5' },
  { type: 'stemCell', icon: 'biotech', color: '#00BCD4' },
  { type: 'other', icon: 'more_horiz', color: '#9E9E9E' },
];

const SIDE_EFFECTS = [
  'Fatigue',
  'Nausea',
  'Hair Loss',
  'Appetite Changes',
  'Pain',
  'Numbness',
  'Skin Changes',
  'Memory Issues',
  'Mouth Sores',
  'Weight Changes',
  'Insomnia',
  'Anxiety',
];

export default function AddTreatmentScreen() {
  const { colors, isDark } = useTheme();
  const save = useSaveTreatment();
  const [type, setType] = useState<TreatmentType>('chemotherapy');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(() => new Date());
  const [totalSessions, setTotalSessions] = useState(0);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const hasSessions = type !== 'surgery' && type !== 'other';
  const muted = isDark ? 'rgba(255,255,255,0.6)' : '#757575';

  const submit = () => {
    if (!name.trim()) {
      showToast('Please enter a treatment name', 'error');
      return;
    }
    save.mutate(
      {
        id: newJourneyId(),
        name: name.trim(),
        type,
        startDate,
        endDate: null,
        doctorName: null,
        hospitalName: null,
        notes: notes.trim() || null,
        totalSessions: hasSessions ? totalSessions : 0,
        completedSessions: 0,
        sideEffects,
        isActive: true,
      },
      {
        onSuccess: () => {
          router.back();
          showToast("Treatment added! You've got this! 💪", 'success');
        },
        onError: (error) => showToast(`Error saving treatment: ${error.message}`, 'error'),
      },
    );
  };

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.divider }];

  return (
    <Screen
      header={
        <AppHeader title="Add Treatment" subtitle="Track your treatment journey" showBackButton />
      }>
      <FormSection title="Treatment Type" icon="medical_services">
        <View style={styles.types}>
          {TYPE_OPTIONS.map((option) => {
            const selected = option.type === type;
            return (
              <Pressable
                key={option.type}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setType(option.type)}
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: selected
                      ? `${option.color}26`
                      : isDark
                        ? colors.card
                        : brand.white,
                    borderColor: selected ? option.color : colors.divider,
                  },
                ]}>
                <MaterialIcon name={option.icon} size={20} color={option.color} />
                <AppText
                  variant="bodySmall"
                  color={selected ? option.color : colors.text}
                  style={styles.typeLabel}>
                  {treatmentTypeLabel(option.type)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </FormSection>

      <FormSection title="Treatment Name" icon="label">
        <FormBox>
          <TextInput
            accessibilityLabel="Treatment name"
            placeholder="e.g., FOLFOX Regimen, Mastectomy, etc."
            placeholderTextColor={colors.inputPlaceholder}
            value={name}
            onChangeText={setName}
            style={[...inputStyle, styles.singleLine]}
          />
        </FormBox>
      </FormSection>

      <FormSection title="Start Date" icon="calendar_today">
        <DateField
          value={startDate}
          onChange={setStartDate}
          minimumDate={new Date(2000, 0, 1)}
          maximumDate={addDays(new Date(), 365)}
          accessibilityLabel="Treatment start date">
          <FormBox style={styles.row}>
            <MaterialIcon name="event" size={24} color={brand.headerPink} />
            <AppText variant="titleMedium" style={styles.flex}>
              {formatShortDate(startDate)}
            </AppText>
            <MaterialIcon name="edit_calendar" size={22} color={brand.headerPink} />
          </FormBox>
        </DateField>
      </FormSection>

      {hasSessions ? (
        <FormSection title="Total Sessions" icon="repeat">
          <FormBox style={styles.sessions}>
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fewer sessions"
                disabled={totalSessions === 0}
                onPress={() => setTotalSessions(totalSessions - 1)}
                style={totalSessions === 0 && styles.dimmed}>
                <MaterialIcon name="remove_circle_outline" size={32} color={brand.headerPink} />
              </Pressable>
              <AppText
                variant="headlineMedium"
                style={styles.sessionCount}
                accessibilityLabel={`${totalSessions} sessions`}>
                {totalSessions === 0 ? 'N/A' : totalSessions}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More sessions"
                onPress={() => setTotalSessions(totalSessions + 1)}>
                <MaterialIcon name="add_circle_outline" size={32} color={brand.headerPink} />
              </Pressable>
            </View>
            <AppText style={[styles.hint, { color: muted }]}>
              {totalSessions === 0
                ? 'Set to 0 if unknown or not applicable'
                : 'You can update this later'}
            </AppText>
          </FormBox>
        </FormSection>
      ) : null}

      <FormSection title="Expected/Experienced Side Effects" icon="warning_amber">
        <ChipSelect options={SIDE_EFFECTS} selected={sideEffects} onChange={setSideEffects} />
      </FormSection>

      <FormSection title="Notes" icon="notes">
        <FormBox>
          <TextInput
            accessibilityLabel="Treatment notes"
            placeholder="Any additional details about this treatment..."
            placeholderTextColor={colors.inputPlaceholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[...inputStyle, styles.notes]}
          />
        </FormBox>
      </FormSection>

      <Button title="Add Treatment" onPress={submit} loading={save.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dimmed: { opacity: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.medium,
    borderWidth: 2,
  },
  typeLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium' },
  input: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  singleLine: { minHeight: 46 },
  notes: { minHeight: 100, textAlignVertical: 'top' },
  sessions: { alignItems: 'center', gap: 8 },
  sessionCount: { minWidth: 70, textAlign: 'center' },
  hint: { fontSize: 11 },
});
