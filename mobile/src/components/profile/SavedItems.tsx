import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { callPhone, openWebPage } from '@/lib/links';
import { formatShortDate } from '@/lib/dates';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';
import { questionDisplayName, type Question } from '@/types/question';
import type { Resource } from '@/types/resource';

import { AppText } from '../AppText';
import { CategoryPill } from '../forum/ForumParts';
import { MaterialIcon } from '../MaterialIcon';
import { RemoveBookmarkButton, SavedCard } from './SavedList';

// Saved question and help-contact rows for the Saved screen
// (from saved_questions_screen.dart and saved_resources_screen.dart).

export function QuestionItem({ question, onRemove }: { question: Question; onRemove: () => void }) {
  const { colors } = useTheme();
  return (
    <SavedCard>
      <View style={questionStyles.row}>
        <CategoryPill category={question.category} />
        {question.isResolved ? (
          <View style={questionStyles.resolved}>
            <MaterialIcon name="check_circle" size={12} color="#4CAF50" />
            <AppText style={questionStyles.resolvedText}>Resolved</AppText>
          </View>
        ) : null}
        <View style={questionStyles.flex} />
        <RemoveBookmarkButton onPress={onRemove} />
      </View>
      {/* The remove button sits outside this tappable area (no nested buttons on web). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={question.title}
        onPress={() => router.push({ pathname: '/community/[id]', params: { id: question.id } })}
        style={questionStyles.body}>
        <AppText variant="titleMedium">{question.title}</AppText>
        <AppText variant="bodySmall" secondary numberOfLines={2}>
          {question.content}
        </AppText>
        <View style={questionStyles.meta}>
          <MaterialIcon name="person_outline" size={14} color={colors.textSecondary} />
          <AppText secondary style={questionStyles.metaText} numberOfLines={1}>
            {questionDisplayName(question)}
          </AppText>
          <MaterialIcon name="arrow_upward" size={14} color={colors.textSecondary} />
          <AppText secondary style={questionStyles.metaText}>
            {question.upvotes}
          </AppText>
          <MaterialIcon name="chat_bubble_outline" size={14} color={colors.textSecondary} />
          <AppText secondary style={questionStyles.metaText}>
            {question.answerCount}
          </AppText>
          <View style={questionStyles.flex} />
          <AppText secondary style={questionStyles.metaText}>
            {formatShortDate(question.createdAt)}
          </AppText>
        </View>
      </Pressable>
    </SavedCard>
  );
}

const questionStyles = StyleSheet.create({
  flex: { flex: 1 },
  body: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resolved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  resolvedText: { fontSize: 11, color: '#4CAF50', fontFamily: 'Poppins_600SemiBold' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, marginRight: 8 },
});

const TYPES: Record<string, { label: string; icon: string; color: string }> = {
  hotline: { label: 'Hotline', icon: 'call', color: '#F44336' },
  screening_center: { label: 'Screening Center', icon: 'local_hospital', color: '#2196F3' },
  financial_support: { label: 'Financial Support', icon: 'account_balance', color: '#4CAF50' },
  support_group: { label: 'Support Group', icon: 'people', color: '#9C27B0' },
};

const OTHER = { label: 'Resource', icon: 'help_outline', color: '#9E9E9E' };

async function emailTo(address: string) {
  try {
    await Linking.openURL(`mailto:${address}`);
  } catch {
    showToast('Could not open email app', 'error');
  }
}

export function ResourceItem({ resource, onRemove }: { resource: Resource; onRemove: () => void }) {
  const { colors } = useTheme();
  const type = TYPES[resource.type] ?? OTHER;
  return (
    <SavedCard>
      <View style={resourceStyles.row}>
        <View style={[resourceStyles.typeIcon, { backgroundColor: `${type.color}1A` }]}>
          <MaterialIcon name={type.icon} size={22} color={type.color} />
        </View>
        <View style={resourceStyles.flex}>
          <AppText variant="label">{resource.name}</AppText>
          <AppText variant="bodySmall" color={type.color}>
            {type.label}
          </AppText>
        </View>
        <RemoveBookmarkButton onPress={onRemove} />
      </View>
      <AppText variant="bodySmall" secondary>
        {resource.description}
      </AppText>
      {resource.isVerified ? (
        <View style={resourceStyles.verified}>
          <MaterialIcon name="verified" size={14} color="#4CAF50" />
          <AppText style={resourceStyles.verifiedText}>Verified Resource</AppText>
        </View>
      ) : null}
      {resource.location || resource.address ? (
        <View style={resourceStyles.row}>
          <MaterialIcon name="location_on" size={16} color={colors.textSecondary} />
          <AppText variant="bodySmall" secondary style={resourceStyles.flex}>
            {resource.address ?? resource.location}
          </AppText>
        </View>
      ) : null}
      <View style={resourceStyles.actions}>
        {resource.phone ? (
          <Action icon="call" label="Call" onPress={() => callPhone(resource.phone!)} />
        ) : null}
        {resource.website ? (
          <Action
            icon="language"
            label="Website"
            onPress={() => openWebPage(resource.website!, 'Could not open website')}
          />
        ) : null}
        {resource.email ? (
          <Action icon="email" label="Email" onPress={() => emailTo(resource.email!)} />
        ) : null}
      </View>
    </SavedCard>
  );
}

function Action({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={resourceStyles.action}>
      <MaterialIcon name={icon} size={16} color={brand.headerPink} />
      <AppText variant="bodySmall" color={brand.headerPink} style={resourceStyles.actionText}>
        {label}
      </AppText>
    </Pressable>
  );
}

const resourceStyles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIcon: { padding: 10, borderRadius: 12 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, color: '#4CAF50', fontFamily: 'Poppins_600SemiBold' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.headerPink,
  },
  actionText: { fontFamily: 'Poppins_600SemiBold' },
});
