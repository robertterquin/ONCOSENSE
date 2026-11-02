import { StyleSheet, View } from 'react-native';

import {
  BottomActionBar,
  Icon,
  ListRow,
  PressableScale,
  ProgressSegments,
  Section,
  Tag,
  Text,
} from '@/components/ui';
import { elevation } from '@/theme/elevation';
import { radii, sizes, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// The pieces every check shares (design refresh Phase 25), so a self-check guide, the
// body check, a screening test and the signs check all read the same way: "Step 2 of 5"
// with a due tag and a bar over a numbered step list, ending with "How did it go?" or,
// for the signs check and change checks, "No, none" / "Yes, I have".

/** "Step 6 of 10 · Breast", the due tag, and the bar. */
export function StepProgress({
  current,
  total,
  label,
  tag,
}: {
  /** Zero-based. */
  current: number;
  total: number;
  /** After the count: the cancer whose steps these are. */
  label?: string;
  tag?: { tone: 'due' | 'next'; label: string };
}) {
  return (
    <View style={styles.progress}>
      <View style={styles.line}>
        <Text variant="caption" tone="muted">
          {`Step ${current + 1} of ${total}${label ? ` · ${label}` : ''}`}
        </Text>
        {tag ? <Tag tone={tag.tone} label={tag.label} /> : null}
      </View>
      <ProgressSegments total={total} done={current + 1} tone="action" accessibilityLabel="Steps" />
    </View>
  );
}

/** The question a self-check ends with (design refresh Phase 22). */
export function HowDidItGo({
  changed,
  onChange,
}: {
  changed: boolean | null;
  onChange: (changed: boolean) => void;
}) {
  return (
    <View style={styles.change}>
      <Text variant="heading" accessibilityRole="header">
        How did it go?
      </Text>
      <Section>
        <ListRow
          icon="check"
          title="Everything looked normal"
          subtitle="The same as last time"
          accessory={changed === false ? <Icon name="check" size={22} tone="action" bold /> : <></>}
          accessibilityLabel={`Everything looked normal${changed === false ? ', selected' : ''}`}
          onPress={() => onChange(false)}
        />
        <ListRow
          icon="circle-alert"
          title="I noticed a change"
          subtitle="A lump, a new spot, pain or anything different"
          accessory={changed ? <Icon name="check" size={22} tone="action" bold /> : <></>}
          accessibilityLabel={`I noticed a change${changed ? ', selected' : ''}`}
          onPress={() => onChange(true)}
        />
      </Section>
      <Text variant="supporting" tone="muted">
        Most changes aren&apos;t cancer, but a doctor should look.
      </Text>
    </View>
  );
}

/** The signs to look for, as a bulleted list (signs check, change checks). */
export function SignList({ signs }: { signs: string[] }) {
  return (
    <>
      {signs.map((sign) => (
        <View key={sign} style={styles.sign}>
          <Text variant="body" tone="action" accessibilityElementsHidden>
            •
          </Text>
          <Text variant="body" style={styles.flex1}>
            {sign}
          </Text>
        </View>
      ))}
    </>
  );
}

/**
 * "No, none" and "Yes, I have" side by side at button height, equal so the app doesn't
 * nudge the answer. What happens next is read out as each one's hint.
 */
export function AnswerButtons({
  noHint,
  yesHint = "We'll show what to do next",
  onAnswer,
}: {
  noHint: string;
  yesHint?: string;
  onAnswer: (yes: boolean) => void;
}) {
  return (
    <BottomActionBar>
      <AnswerCard title="No, none" hint={noHint} onPress={() => onAnswer(false)} />
      <AnswerCard title="Yes, I have" hint={yesHint} onPress={() => onAnswer(true)} />
    </BottomActionBar>
  );
}

function AnswerCard({
  title,
  hint,
  onPress,
}: {
  title: string;
  hint: string;
  onPress: () => void;
}) {
  const { palette, isDark } = useDesign();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={hint}
      onPress={onPress}
      style={[
        styles.answer,
        { backgroundColor: palette.surface },
        elevation('resting', palette, isDark),
      ]}>
      <Text variant="strong" tone="action" numberOfLines={1} style={styles.answerLabel}>
        {title}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  sign: { flexDirection: 'row', gap: space.sm, paddingVertical: space.xs },
  // Each takes half the bar, at button height.
  answer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touch,
    paddingHorizontal: space.md,
    borderRadius: radii.control,
  },
  answerLabel: { flexShrink: 1 },
  progress: { gap: space.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  change: { gap: space.md, paddingTop: space.md },
});
