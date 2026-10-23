import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { MaterialIcon } from '@/components/MaterialIcon';
import { RemoveBookmarkButton, SavedCard, SavedList } from '@/components/profile/SavedList';
import { useBookmarkedArticles, useToggleArticleBookmark } from '@/hooks/useBookmarks';
import { openWebPage } from '@/lib/links';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { radius } from '@/theme/tokens';
import type { Article } from '@/types/article';

// Port of lib/screens/profile/saved_articles_screen.dart

export default function SavedArticlesScreen() {
  const query = useBookmarkedArticles();
  const { toggle } = useToggleArticleBookmark();

  return (
    <SavedList<Article>
      title="Saved Articles"
      subtitle="Your bookmarked articles"
      query={query}
      errorPrefix="Error loading saved articles"
      empty={{
        icon: 'bookmark_border',
        title: 'No Saved Articles',
        message: 'Articles you bookmark will appear here for easy access later.',
        action: 'Explore Articles',
        href: '/home',
      }}
      renderItem={(article) => (
        <ArticleItem
          key={article.url}
          article={article}
          onRemove={() => {
            toggle(article);
            showToast('Article removed from bookmarks');
          }}
        />
      )}
    />
  );
}

function ArticleItem({ article, onRemove }: { article: Article; onRemove: () => void }) {
  const [failed, setFailed] = useState(false);
  const open = () => openWebPage(article.url, 'Could not open article');
  return (
    <SavedCard>
      <View style={styles.row}>
        <View style={styles.thumb}>
          {article.imageUrl && !failed ? (
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.thumbImage}
              contentFit="cover"
              onError={() => setFailed(true)}
            />
          ) : (
            <MaterialIcon name="article" size={32} color="rgba(216,27,96,0.4)" />
          )}
        </View>
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={2}>
            {article.title}
          </AppText>
          <AppText variant="bodySmall" secondary numberOfLines={1}>
            {article.sourceName}
          </AppText>
        </View>
        <RemoveBookmarkButton onPress={onRemove} />
      </View>
      {article.description ? (
        <AppText variant="bodySmall" secondary numberOfLines={3}>
          {article.description}
        </AppText>
      ) : null}
      <Pressable accessibilityRole="link" onPress={open} style={styles.read}>
        <AppText variant="label" color={brand.headerPink}>
          Read Article
        </AppText>
        <MaterialIcon name="open_in_new" size={16} color={brand.headerPink} />
      </Pressable>
    </SavedCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: brand.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: { width: '100%', height: '100%' },
  read: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end' },
});
