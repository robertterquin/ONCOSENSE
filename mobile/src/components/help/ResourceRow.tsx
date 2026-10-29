import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, ListRow, Sheet, Text } from '@/components/ui';
import { useResourceBookmarks } from '@/hooks/useBookmarkToggle';
import { callLabel } from '@/lib/help';
import { callPhone, openWebPage } from '@/lib/links';
import { showToast } from '@/stores/toastStore';
import { space } from '@/theme/tokens';
import type { Resource } from '@/types/resource';

// One help contact (redesign Phase 5): name, place and number, a round call button,
// and a More menu with Save and Copy number. Contacts without a phone show their
// website instead.

export function ResourceRow({ resource }: { resource: Resource }) {
  const bookmarks = useResourceBookmarks();
  const [menu, setMenu] = useState(false);
  const saved = bookmarks.isSaved(resource);
  // Own line for the number, so it never breaks in the middle.
  const detail = [resource.location, resource.phone ?? resource.website].filter(Boolean).join('\n');

  const copyNumber = async () => {
    setMenu(false);
    if (!resource.phone) return;
    await Clipboard.setStringAsync(resource.phone);
    showToast(`Copied ${resource.phone}`);
  };

  return (
    <>
      <ListRow
        title={resource.name}
        subtitle={detail || undefined}
        accessory={
          <View style={styles.actions}>
            {resource.phone ? (
              <IconButton
                icon="phone"
                look="help"
                size={44}
                accessibilityLabel={callLabel(resource)}
                onPress={() => callPhone(resource.phone!)}
              />
            ) : resource.website ? (
              <IconButton
                icon="external-link"
                look="tinted"
                size={44}
                accessibilityLabel={`Open ${resource.name}'s website`}
                onPress={() => openWebPage(resource.website!)}
              />
            ) : null}
            <IconButton
              icon="more"
              size={44}
              accessibilityLabel={`More for ${resource.name}`}
              onPress={() => setMenu(true)}
            />
          </View>
        }
      />
      <Sheet visible={menu} onClose={() => setMenu(false)} title={resource.name}>
        {resource.description ? (
          <Text variant="body" tone="muted">
            {resource.description}
          </Text>
        ) : null}
        <ListRow
          icon="bookmark"
          title={saved ? 'Remove from saved' : 'Save to Profile'}
          onPress={() => {
            setMenu(false);
            bookmarks.toggle(resource);
          }}
        />
        {resource.phone ? (
          <ListRow icon="copy" title="Copy number" subtitle={resource.phone} onPress={copyNumber} />
        ) : null}
        {resource.website ? (
          <ListRow
            icon="globe"
            title="Open website"
            subtitle={resource.website}
            onPress={() => {
              setMenu(false);
              void openWebPage(resource.website!);
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
});
