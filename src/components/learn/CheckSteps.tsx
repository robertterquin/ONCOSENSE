import { StyleSheet, View } from 'react-native';

import { Icon, ListRow, ProgressSegments, Section, Tag, Text } from '@/components/ui';
import { space } from '@/theme/tokens';

// The pieces every check shares (design refresh Phase 25), so a self-check guide, the
// body check, a screening test and the signs check all read the same way: "Step 2 of 5"
// with a due tag and a bar over a numbered step list, ending with "How did it go?".

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
      <ProgressSegments
        total={total}
        done={current + 1}
        tone="action"
        accessibilityLabel="Steps"
      />
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

const styles = StyleSheet.create({
  progress: { gap: space.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  change: { gap: space.md, paddingTop: space.md },
});
