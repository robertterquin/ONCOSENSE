import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  Banner,
  BottomActionBar,
  Button,
  Chip,
  Icon,
  IconButton,
  ICON_NAMES,
  ListRow,
  NextStepPanel,
  ProgressSegments,
  RibbonMark,
  Screen,
  SearchField,
  Section,
  SegmentedControl,
  SliderRow,
  StatTile,
  StepList,
  Switch,
  Tag,
  Text,
  TextField,
  TopicTile,
} from '@/components/ui';
import { MoodPicker } from '@/components/journey/MoodPicker';
import { emailSchema } from '@/constants/validation';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';
import { showToast } from '@/stores/toastStore';
import type { Palette } from '@/theme/palette';
import { radii, space } from '@/theme/tokens';
import { typeScale, type TextSize, type TypeVariant } from '@/theme/type';
import { useDesign } from '@/theme/useTheme';

/** Development-only gallery of the redesign components (compare with the Foundations artboard). */
export default function ComponentGalleryScreen() {
  const { palette } = useDesign();
  const { mode, setMode, textSize, setTextSize } = useThemeStore();
  const [email, setEmail] = useState('not-an-email');
  const emailError = emailSchema.safeParse(email).error?.issues[0]?.message ?? null;
  const [symptoms, setSymptoms] = useState(['Fatigue']);
  const [sleep, setSleep] = useState('Fair');
  const [reminders, setReminders] = useState(true);
  const [mood, setMood] = useState<number | null>(4);
  const [pain, setPain] = useState(3);

  if (!__DEV__) return <Redirect href="/" />;

  const toggleSymptom = (name: string) =>
    setSymptoms((list) =>
      list.includes(name) ? list.filter((item) => item !== name) : [...list, name],
    );

  return (
    <Screen
      title="Components"
      subtitle="Redesign foundations"
      back={{ label: 'Back' }}
      bottomBar={
        <BottomActionBar>
          <Button title="Back" variant="secondary" onPress={() => {}} style={styles.flex1} />
          <Button title="Next step" onPress={() => showToast('Next step')} style={styles.flex2} />
        </BottomActionBar>
      }>
      <Section title="Display" look="card" divided={false}>
        <View style={styles.stack}>
          <Text variant="row">Theme</Text>
          <SegmentedControl<ThemeMode>
            accessibilityLabel="Theme"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'Phone' },
            ]}
          />
          <Text variant="row">Text size</Text>
          <SegmentedControl<TextSize>
            accessibilityLabel="Text size"
            value={textSize}
            onChange={setTextSize}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'large', label: 'Large' },
              { value: 'larger', label: 'Larger' },
            ]}
          />
        </View>
      </Section>

      <Section title="Color" look="plain">
        <View style={styles.swatches}>
          {(Object.keys(palette) as (keyof Palette)[]).map((token) => (
            <View key={token} style={styles.swatch}>
              <View
                style={[
                  styles.swatchColor,
                  { backgroundColor: palette[token], borderColor: palette.border },
                ]}
              />
              <Text variant="caption">{token}</Text>
              <Text variant="caption" tone="muted">
                {palette[token]}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type" look="card" divided={false}>
        <View style={styles.stack}>
          {(Object.keys(typeScale) as TypeVariant[]).map((variant) => (
            <Text key={variant} variant={variant}>
              {variant}: Breast self-exam
            </Text>
          ))}
        </View>
      </Section>

      <Section title="Icons" look="card" divided={false}>
        <View style={styles.icons}>
          {ICON_NAMES.map((name) => (
            <View key={name} style={styles.iconCell}>
              <Icon name={name} tone="action" />
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.ribbons}>
          <RibbonMark height={80} color={palette.action} />
          <RibbonMark height={48} color={palette.rose} weight={24} />
          <RibbonMark height={80} color={palette.panel} highlight={palette.raised} weight={26} />
        </View>
      </Section>

      <Section title="Tags and tiles" look="plain">
        <View style={styles.wrap}>
          <Tag tone="due" label="Due" />
          <Tag tone="done" label="Done 6 days ago" />
          <Tag tone="next" label="Next" />
        </View>
        <View style={styles.inlineRow}>
          <StatTile label="Energy, 7 days" value="6.2" detail="of 10, up from 5" />
          <StatTile label="Pain, 7 days" value="2.5" detail="of 10, steady" valueTone="rose" />
        </View>
        <View style={styles.inlineRow}>
          <TopicTile icon="ribbon" title="Breast" subtitle="Most common here" onPress={() => {}} />
          <TopicTile icon="lungs" title="Lung" subtitle="7 early signs" onPress={() => {}} />
        </View>
        <View style={styles.inlineRow}>
          <TopicTile icon="stethoscope" iconTone="rose" title="Rose" onPress={() => {}} />
          <TopicTile icon="pill" iconTone="sun" title="Sun" onPress={() => {}} />
        </View>
      </Section>

      <NextStepPanel
        status="Due today"
        title="Your monthly breast self-check"
        body="About 10 minutes. We'll guide you one step at a time."
        primary={{ label: 'Start self-check', onPress: () => showToast('Started') }}
        secondary={{
          label: 'Remind me tomorrow',
          onPress: () => showToast('Reminder set', 'success'),
        }}
      />

      <Section title="Buttons" look="plain">
        <Button title="Save check-in" onPress={() => showToast('Check-in saved', 'success')} />
        <Button title="Edit profile" variant="secondary" onPress={() => {}} />
        <Button title="Call 1555" variant="help" icon="phone" onPress={() => {}} />
        <Button
          title="Delete account"
          variant="destructive"
          onPress={() => showToast('Could not delete account', 'error')}
        />
        <Button title="Show 3 more centers" variant="quiet" fullWidth={false} onPress={() => {}} />
        <Button title="Saving" loading onPress={() => {}} />
        <View style={styles.inline}>
          <IconButton icon="bookmark" accessibilityLabel="Save" onPress={() => {}} />
          <IconButton
            icon="plus"
            look="tinted"
            accessibilityLabel="Add a treatment"
            onPress={() => {}}
          />
          <IconButton
            icon="plus"
            look="primary"
            accessibilityLabel="Ask a question"
            onPress={() => {}}
          />
          <IconButton
            icon="phone"
            look="help"
            accessibilityLabel="Call Department of Health, 1555"
            onPress={() => {}}
          />
        </View>
      </Section>

      <Section title="Rows" subtitle="Icon tiles, subtitles and accessories">
        <ListRow
          icon="calendar-check"
          iconTone="rose"
          title="Breast self-exam"
          subtitle="Due today"
          subtitleTone="rose"
          onPress={() => {}}
        />
        <ListRow
          icon="pill"
          title="Chemotherapy, cycle 3 of 6"
          subtitle="Tuesday, Oct 28 at 9:00 AM"
          onPress={() => {}}
        />
        <ListRow icon="bookmark" title="Saved" trailing="6 items" onPress={() => {}} />
        <ListRow
          title="Philippine Cancer Society"
          subtitle="(02) 8508-7777, Metro Manila"
          accessory={
            <IconButton
              icon="phone"
              look="help"
              accessibilityLabel="Call Philippine Cancer Society"
              onPress={() => {}}
            />
          }
        />
        <ListRow
          title="Daily check-in"
          subtitle="Every day, 8:00 PM"
          accessory={
            <Switch
              accessibilityLabel="Daily check-in"
              value={reminders}
              onValueChange={setReminders}
            />
          }
        />
        <ListRow icon="flag" iconTone="sun" title="Finished cycle 2" subtitle="October 7" />
      </Section>

      <Section title="Mood" look="card" divided={false}>
        <View style={styles.moodSample}>
          <MoodPicker value={mood} onChange={setMood} />
        </View>
      </Section>

      <Section title="Choices" look="card" divided={false}>
        <View style={styles.stack}>
          <Text variant="row">Any symptoms?</Text>
          <View style={styles.wrap}>
            {['Fatigue', 'Nausea', 'Headache', 'Loss of appetite'].map((name) => (
              <Chip
                key={name}
                label={name}
                selected={symptoms.includes(name)}
                onPress={() => toggleSymptom(name)}
              />
            ))}
          </View>
          <Text variant="row">Sleep last night</Text>
          <View style={styles.wrap}>
            {['Poor', 'Fair', 'Good'].map((name) => (
              <Chip
                key={name}
                kind="radio"
                label={name}
                selected={sleep === name}
                onPress={() => setSleep(name)}
              />
            ))}
          </View>
          <SliderRow
            label="Pain"
            value={pain}
            min={0}
            max={10}
            onChange={setPain}
            valueText={pain === 0 ? 'No pain' : `${pain} of 10`}
            minLabel="No pain"
            maxLabel="Worst pain"
          />
        </View>
      </Section>

      <Section title="Fields" look="plain">
        <SearchField accessibilityLabel="Search" placeholder="Search cancers, symptoms, checks" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField label="Password" secure placeholder="Enter your password" />
        <TextField
          label="Notes"
          multiline
          placeholder="Anything you want to remember or tell your doctor"
        />
      </Section>

      <Banner tone="guard">
        Share experiences, not diagnoses. Answers here are from members, not doctors.
      </Banner>
      <Banner tone="help" title="Need someone to talk to?">
        Free hotlines and support groups across the Philippines.
      </Banner>

      <Section title="Progress" look="card" divided={false}>
        <View style={styles.stack}>
          <ProgressSegments total={6} done={2} accessibilityLabel="Treatment cycles" />
          <ProgressSegments total={6} done={2} tone="rose" accessibilityLabel="Self-check steps" />
          <StepList
            current={1}
            steps={[
              { title: 'Look in the mirror' },
              { title: 'Check the skin and nipples' },
              { title: 'Lie down, one arm behind your head' },
            ]}>
            <Text variant="reading">
              With your arms at your sides, then raised, look for dimpling, redness or a nipple that
              has turned inward.
            </Text>
          </StepList>
        </View>
      </Section>

      <Section title="States" look="card" divided={false}>
        <LoadingState message="Loading cancer types" />
        <ErrorState
          message="Couldn't load your journey. Check your connection and try again."
          onRetry={() => {}}
        />
        <EmptyState
          icon="bookmark"
          title="No saved questions"
          message="Save questions in Community to find them here."
        />
      </Section>

      <View style={styles.inline}>
        <Button
          title="Info toast"
          variant="secondary"
          fullWidth={false}
          onPress={() => showToast('Removed from saved')}
        />
        <Button
          title="Error toast"
          variant="secondary"
          fullWidth={false}
          onPress={() => showToast("Couldn't save", 'error')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  inlineRow: { flexDirection: 'row', gap: space.sm },
  moodSample: { paddingVertical: space.lg },
  flex2: { flex: 2 },
  stack: { gap: space.md, paddingVertical: space.lg },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  inline: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  swatch: { width: 100, gap: 2 },
  swatchColor: { height: 44, borderRadius: radii.tile, borderWidth: 1 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingVertical: space.lg },
  iconCell: { width: 72, alignItems: 'center', gap: 4 },
  ribbons: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xxl,
    paddingBottom: space.lg,
  },
});
