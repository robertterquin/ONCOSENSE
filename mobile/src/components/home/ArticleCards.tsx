import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useArticleBookmarks } from '@/hooks/useBookmarkToggle';
import { openWebPage } from '@/lib/links';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { articleReadTime, type Article } from '@/types/article';

import { AppText } from '../AppText';
import { MaterialIcon } from '../MaterialIcon';

// Survivor story and article preview cards from home_screen.dart.

const openArticle = (article: Article) => openWebPage(article.url, 'Could not open article');

/** GNews dates are ISO strings; show "Oct 20, 2026" (Flutter showed the raw string). */
function formatPublished(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Article image on a pink gradient, falling back to an icon when missing or broken. */
function ArticleImage({
  uri,
  height,
  rounded,
  fallbackIcon,
}: {
  uri: string | null;
  height: number;
  rounded: number;
  fallbackIcon: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <LinearGradient
      colors={['#FCE4EC', '#F8BBD0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.imageBox,
        { height, borderTopLeftRadius: rounded, borderTopRightRadius: rounded },
      ]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <MaterialIcon name={fallbackIcon} size={56} color="rgba(216, 27, 96, 0.3)" />
      )}
    </LinearGradient>
  );
}

function FloatingBookmark({ article, size }: { article: Article; size: number }) {
  const bookmarks = useArticleBookmarks();
  const saved = bookmarks.isSaved(article);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove bookmark' : 'Add bookmark'}
      onPress={() => bookmarks.toggle(article)}
      hitSlop={6}
      style={[styles.floatingBookmark, { padding: size === 20 ? 6 : 8 }]}>
      <MaterialIcon
        name={saved ? 'bookmark' : 'bookmark_border'}
        size={size}
        color={brand.headerPink}
      />
    </Pressable>
  );
}

function useCardStyle() {
  const { colors, isDark } = useTheme();
  return [
    styles.card,
    { backgroundColor: colors.card, borderColor: isDark ? colors.divider : '#E0E0E0' },
    !isDark && styles.shadow,
  ];
}

export function SurvivorStoryCard({ article }: { article: Article }) {
  const cardStyle = useCardStyle();
  return (
    <View style={[cardStyle, { borderRadius: radius.large }]}>
      {/* The bookmark sits beside, not inside, the tappable area (no nested buttons on web). */}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Survivor story: ${article.title}`}
        onPress={() => openArticle(article)}>
        <ArticleImage uri={article.imageUrl} height={180} rounded={16} fallbackIcon="favorite" />
        <View style={styles.body}>
          <View style={styles.storyPill}>
            <AppText style={styles.storyPillText}>Survivor Story</AppText>
          </View>
          <AppText variant="titleMedium" numberOfLines={2} style={styles.bold}>
            {article.title}
          </AppText>
          <AppText secondary numberOfLines={3} style={styles.excerpt}>
            {article.description}
          </AppText>
          <View style={styles.sourceRow}>
            <View style={styles.avatar}>
              <AppText variant="label" color={brand.headerPink} style={styles.bold}>
                {(article.sourceName[0] ?? 'N').toUpperCase()}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="label" numberOfLines={1} style={styles.sourceName}>
                {article.sourceName}
              </AppText>
              <AppText secondary style={styles.small}>
                {formatPublished(article.publishedAt)}
              </AppText>
            </View>
            <AppText variant="label" color={brand.headerPink} style={styles.readMore}>
              Read More
            </AppText>
          </View>
        </View>
      </Pressable>
      <View style={styles.bookmarkPosition}>
        <FloatingBookmark article={article} size={24} />
      </View>
    </View>
  );
}

export function ArticlePreviewCard({ article }: { article: Article }) {
  const cardStyle = useCardStyle();
  return (
    <View style={cardStyle}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={article.title}
        onPress={() => openArticle(article)}>
        <ArticleImage uri={article.imageUrl} height={120} rounded={12} fallbackIcon="article" />
        <View style={[styles.body, styles.previewBody]}>
          <AppText variant="label" numberOfLines={2}>
            {article.title}
          </AppText>
          <AppText variant="bodySmall" secondary numberOfLines={2}>
            {article.description}
          </AppText>
          <View style={styles.readTime}>
            <MaterialIcon name="access_time" size={12} color="#BDBDBD" />
            <AppText secondary style={styles.small}>
              {articleReadTime(article)}
            </AppText>
          </View>
        </View>
      </Pressable>
      <View style={[styles.bookmarkPosition, styles.previewBookmark]}>
        <FloatingBookmark article={article} size={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bold: {
    fontFamily: 'Poppins_700Bold',
  },
  card: {
    borderRadius: radius.medium,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  body: {
    padding: 16,
    gap: 8,
  },
  previewBody: {
    gap: 4,
  },
  storyPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: brand.lightPink,
    marginBottom: 4,
  },
  storyPillText: {
    fontSize: 11,
    color: brand.headerPink,
    fontFamily: 'Poppins_600SemiBold',
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 18,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brand.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceName: {
    fontSize: 13,
  },
  small: {
    fontSize: 11,
  },
  readMore: {
    fontSize: 13,
    paddingHorizontal: 12,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bookmarkPosition: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  previewBookmark: {
    top: 8,
    right: 8,
  },
  floatingBookmark: {
    borderRadius: 999,
    backgroundColor: brand.white,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
