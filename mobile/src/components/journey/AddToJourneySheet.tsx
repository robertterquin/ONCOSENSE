import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { newJourneyId } from '@/api/journey';
import { useAddMilestone } from '@/hooks/useJourney';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// The Journey tab's "+" menu and "Add Milestone" dialog (journey_screen.dart).

const OPTIONS = [
  {
    key: 'entry',
    icon: 'edit_note',
    title: 'Daily Journal Entry',
    subtitle: 'Log your mood, pain, and symptoms',
    color: '#2196F3',
  },
  {
    key: 'treatment',
    icon: 'medical_services',
    title: 'New Treatment',
    subtitle: 'Add a new treatment to track',
    color: '#9C27B0',
  },
  {
    key: 'milestone',
    icon: 'emoji_events',
    title: 'Custom Milestone',
    subtitle: 'Celebrate a personal achievement',
    color: '#FF9800',
  },
] as const;

export function AddToJourneySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [addingMilestone, setAddingMilestone] = useState(false);

  const choose = (key: (typeof OPTIONS)[number]['key']) => {
    onClose();
    if (key === 'entry') router.push('/journey/check-in');
    else if (key === 'treatment') router.push('/journey/treatment');
    else setAddingMilestone(true);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: isDark ? colors.card : brand.white,
                paddingBottom: 20 + insets.bottom,
              },
            ]}>
            <View style={styles.handle} />
            <AppText variant="titleLarge" style={styles.sheetTitle}>
              Add to Journey
            </AppText>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                onPress={() => choose(option.key)}
                style={[
                  styles.option,
                  { backgroundColor: `${option.color}1A`, borderColor: `${option.color}4D` },
                ]}>
                <View style={[styles.optionIcon, { backgroundColor: `${option.color}33` }]}>
                  <MaterialIcon name={option.icon} size={24} color={option.color} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="titleMedium">{option.title}</AppText>
                  <AppText variant="bodySmall" color={isDark ? 'rgba(255,255,255,0.6)' : '#757575'}>
                    {option.subtitle}
                  </AppText>
                </View>
                <MaterialIcon name="arrow_forward_ios" size={16} color={option.color} />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <AddMilestoneDialog visible={addingMilestone} onClose={() => setAddingMilestone(false)} />
    </>
  );
}

function AddMilestoneDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const addMilestone = useAddMilestone();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const close = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  const add = () => {
    if (!title.trim()) return;
    addMilestone.mutate(
      {
        id: newJourneyId('personal'),
        title: title.trim(),
        description: description.trim() || 'Personal milestone achieved!',
        type: 'personal',
        dateAchieved: new Date(),
        isCelebrated: false,
        iconName: null,
        daysCount: null,
      },
      {
        onSuccess: () => {
          showToast('🎉 Milestone added!', 'success');
          close();
        },
        onError: (error) => showToast(`Error: ${error.message}`, 'error'),
      },
    );
  };

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.divider }];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.center}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <AppText variant="titleLarge">Add Milestone</AppText>
          <AppText variant="label">Title</AppText>
          <TextInput
            accessibilityLabel="Milestone title"
            placeholder="e.g., First chemo session complete!"
            placeholderTextColor={colors.inputPlaceholder}
            value={title}
            onChangeText={setTitle}
            style={inputStyle}
          />
          <AppText variant="label">Description (optional)</AppText>
          <TextInput
            accessibilityLabel="Milestone description"
            placeholder="Add more details..."
            placeholderTextColor={colors.inputPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            style={[...inputStyle, styles.multiline]}
          />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={close} style={styles.action}>
              <AppText variant="label" color={brand.headerPink}>
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!title.trim() || addMilestone.isPending}
              onPress={add}
              style={[
                styles.action,
                styles.addButton,
                (!title.trim() || addMilestone.isPending) && styles.dimmed,
              ]}>
              <AppText variant="label" color={brand.white}>
                Add
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dimmed: { opacity: 0.4 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  sheetTitle: { marginVertical: 8, textAlign: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: radius.large,
    borderWidth: 1,
  },
  optionIcon: { padding: 10, borderRadius: 12 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: { width: '100%', maxWidth: 420, borderRadius: radius.large, padding: 24, gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  action: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.small },
  addButton: { backgroundColor: brand.headerPink },
});
