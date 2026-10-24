import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import {
  forumCategoryIcon,
  questionDisplayName,
  questionRelativeTime,
  type Question,
} from '@/types/question';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// Pieces shared by the forum list and question detail screens (forum_screen.dart,
// question_detail_screen.dart).

export function CategoryPill({ category }: { category: string }) {
  return (
    <View style={styles.categoryPill}>
      <AppText style={styles.categoryText}>
        {forumCategoryIcon(category)} {category}
      </AppText>
    </View>
  );
}

/** Profile photo, or the first letter of the name ("?" for anonymous posts). */
export function UserAvatar({
  name,
  pictureUrl,
  isAnonymous,
  size = 20,
}: {
  name: string | null;
  pictureUrl: string | null;
  isAnonymous: boolean;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const circle = { width: size, height: size, borderRadius: size / 2 };
  if (!isAnonymous && pictureUrl && !failed) {
    return (
      <Image
        source={{ uri: pictureUrl }}
        style={[circle, styles.avatarImage]}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View
      style={[
        circle,
        styles.avatarLetter,
        { backgroundColor: isAnonymous ? '#E0E0E0' : brand.lightPink },
      ]}>
      <AppText
        style={[
          styles.avatarText,
          { fontSize: size / 2, color: isAnonymous ? '#9E9E9E' : brand.headerPink },
        ]}>
        {isAnonymous ? '?' : (name?.[0]?.toUpperCase() ?? 'U')}
      </AppText>
    </View>
  );
}

/** Thumbs-up count; filled and pink when the user has upvoted. */
export function UpvoteButton({
  count,
  upvoted,
  onPress,
}: {
  count: number;
  upvoted: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${upvoted ? 'Remove upvote' : 'Upvote'}, ${count} upvotes`}
      accessibilityState={{ selected: upvoted }}
      onPress={onPress}
      hitSlop={6}
      style={[
        styles.upvote,
        {
          backgroundColor: upvoted ? brand.lightPink : colors.card,
          borderColor: upvoted ? brand.headerPink : colors.divider,
        },
      ]}>
      <MaterialIcon
        name={upvoted ? 'thumb_up' : 'thumb_up_off_alt'}
        size={14}
        color={upvoted ? brand.headerPink : '#757575'}
      />
      <AppText style={[styles.upvoteText, { color: upvoted ? brand.headerPink : '#757575' }]}>
        {count}
      </AppText>
    </Pressable>
  );
}

/** A question in the forum list. */
export function QuestionListCard({ question, now }: { question: Question; now: Date }) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={question.title}
      onPress={() => router.push({ pathname: '/community/[id]', params: { id: question.id } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.divider },
        !isDark && styles.shadow,
        pressed && styles.pressed,
      ]}>
      <CategoryPill category={question.category} />
      <AppText variant="label">{question.title}</AppText>
      <AppText variant="bodySmall" secondary numberOfLines={2}>
        {question.content}
      </AppText>
      <View style={styles.meta}>
        <UserAvatar
          name={question.userName}
          pictureUrl={question.profilePictureUrl}
          isAnonymous={question.isAnonymous}
        />
        <AppText secondary numberOfLines={1} style={[styles.metaText, styles.metaName]}>
          {questionDisplayName(question)}
        </AppText>
        <MaterialIcon name="message" size={14} color={colors.textSecondary} />
        <AppText secondary style={styles.metaText}>
          {question.answerCount}
        </AppText>
        <MaterialIcon name="schedule" size={14} color={colors.textSecondary} />
        <AppText secondary numberOfLines={1} style={[styles.metaText, styles.flexShrink]}>
          {questionRelativeTime(question, now)}
        </AppText>
        <View style={styles.flex} />
        <View style={styles.upvoteBadge}>
          <MaterialIcon name="thumb_up_off_alt" size={12} color={brand.headerPink} />
          <AppText style={styles.upvoteBadgeText}>{question.upvotes}</AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: brand.lightPink,
  },
  categoryText: {
    fontSize: 11,
    color: brand.headerPink,
    fontFamily: 'Poppins_600SemiBold',
  },
  avatarImage: {
    backgroundColor: brand.lightPink,
  },
  avatarLetter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins_700Bold',
  },
  upvote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  upvoteText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  card: {
    padding: 16,
    borderRadius: radius.medium,
    borderWidth: 1,
    gap: 8,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
  },
  metaName: {
    flexShrink: 1,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 2,
    marginRight: 8,
  },
  upvoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: brand.lightPink,
  },
  upvoteBadgeText: {
    fontSize: 11,
    color: brand.headerPink,
    fontFamily: 'Poppins_600SemiBold',
  },
});
