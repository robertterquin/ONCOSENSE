import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { userDisplayName, userProfilePictureUrl } from '@/api/auth';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { ArticlePreviewCard, SurvivorStoryCard } from '@/components/home/ArticleCards';
import { HealthReminderCard } from '@/components/home/HealthReminderCard';
import { AwarenessBanner, DailyTipCard } from '@/components/home/TipAndAwareness';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import { LoadingState } from '@/components/StateViews';
import {
  useCancerArticles,
  useDailyHealthTip,
  useHealthReminders,
  useSurvivorStory,
} from '@/hooks/useHome';
import { useUser } from '@/stores/authStore';
import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

// Port of lib/screens/home/home_screen.dart. Notification-center features (badge
// count, sample notifications, long-press test notification) arrive in Phase 6.

export default function HomeTab() {
  const user = useUser();
  const tip = useDailyHealthTip();
  const reminders = useHealthReminders();
  const story = useSurvivorStory();
  const articles = useCancerArticles();

  const refresh = () => Promise.all([reminders.refetch(), story.refetch(), articles.refetch()]);

  return (
    <Screen
      inTabs
      background="surface"
      onRefresh={refresh}
      refreshing={reminders.isRefetching || story.isRefetching || articles.isRefetching}
      header={
        <AppHeader
          title={`Hello, ${userDisplayName(user)} 👋`}
          subtitle="Your wellness journey starts here"
          titleSize={18}
          right={<HeaderActions pictureUrl={userProfilePictureUrl(user)} />}
        />
      }>
      <DailyTipCard tip={tip} />
      <AwarenessBanner />

      <SectionTitle
        title="Health Reminders"
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh reminders"
            hitSlop={8}
            onPress={() => reminders.refetch()}>
            <MaterialIcon name="refresh" size={20} color={brand.headerPink} />
          </Pressable>
        }
      />
      {reminders.isPending ? (
        <LoadingState />
      ) : (
        reminders.data?.map((reminder) => (
          <HealthReminderCard key={reminder.id} reminder={reminder} />
        ))
      )}

      <SectionTitle title="Inspiring Stories" />
      {story.isPending ? (
        <LoadingState />
      ) : story.data ? (
        <SurvivorStoryCard article={story.data} />
      ) : null}

      <SectionTitle title="Latest Articles" />
      {articles.isPending ? (
        <LoadingState />
      ) : articles.isError ? (
        <ArticlesMessage icon="error_outline" text="Failed to load articles" />
      ) : articles.data.length === 0 ? (
        <ArticlesMessage icon="article" text="No articles available" />
      ) : (
        articles.data
          .slice(0, 3)
          .map((article) => <ArticlePreviewCard key={article.url} article={article} />)
      )}
    </Screen>
  );
}

function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="titleMedium" style={styles.bold}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

function ArticlesMessage({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.message}>
      <MaterialIcon name={icon} size={48} color="#BDBDBD" />
      <AppText color="#757575">{text}</AppText>
    </View>
  );
}

function HeaderActions({ pictureUrl }: { pictureUrl: string | null }) {
  const [pictureFailed, setPictureFailed] = useState(false);
  const { isDark } = useTheme();
  return (
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={() => router.push('/notifications')}
        style={styles.bell}>
        <MaterialIcon name="notifications_none" size={24} color={brand.white} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => router.push('/profile')}
        style={[styles.avatar, isDark && styles.avatarDark]}>
        {pictureUrl && !pictureFailed ? (
          <Image
            source={{ uri: pictureUrl }}
            style={styles.avatarImage}
            contentFit="cover"
            onError={() => setPictureFailed(true)}
          />
        ) : (
          <MaterialIcon name="person" size={24} color={brand.headerPink} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  message: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarDark: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
