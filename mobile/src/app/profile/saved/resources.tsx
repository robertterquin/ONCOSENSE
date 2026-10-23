import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { MaterialIcon } from '@/components/MaterialIcon';
import { RemoveBookmarkButton, SavedCard, SavedList } from '@/components/profile/SavedList';
import { useBookmarkedResources, useToggleResourceBookmark } from '@/hooks/useBookmarks';
import { callPhone, openWebPage } from '@/lib/links';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';
import type { Resource } from '@/types/resource';

// Port of lib/screens/profile/saved_resources_screen.dart

const TYPES: Record<string, { label: string; icon: string; color: string }> = {
  hotline: { label: 'Hotline', icon: 'call', color: '#F44336' },
  screening_center: { label: 'Screening Center', icon: 'local_hospital', color: '#2196F3' },
  financial_support: { label: 'Financial Support', icon: 'account_balance', color: '#4CAF50' },
  support_group: { label: 'Support Group', icon: 'people', color: '#9C27B0' },
};

const OTHER = { label: 'Resource', icon: 'help_outline', color: '#9E9E9E' };

export default function SavedResourcesScreen() {
  const query = useBookmarkedResources();
  const { toggle } = useToggleResourceBookmark();

  return (
    <SavedList<Resource>
      title="Saved Resources"
      subtitle="Your favorite support resources"
      query={query}
      errorPrefix="Error loading saved resources"
      empty={{
        icon: 'favorite_border',
        title: 'No Saved Resources',
        message: 'Resources you bookmark will appear here for easy access later.',
        action: 'Explore Resources',
        href: '/resources',
      }}
      renderItem={(resource) => (
        <ResourceItem
          key={resource.id}
          resource={resource}
          onRemove={() => {
            toggle(resource);
            showToast('Resource removed from bookmarks');
          }}
        />
      )}
    />
  );
}

async function emailTo(address: string) {
  try {
    await Linking.openURL(`mailto:${address}`);
  } catch {
    showToast('Could not open email app', 'error');
  }
}

function ResourceItem({ resource, onRemove }: { resource: Resource; onRemove: () => void }) {
  const { colors } = useTheme();
  const type = TYPES[resource.type] ?? OTHER;
  return (
    <SavedCard>
      <View style={styles.row}>
        <View style={[styles.typeIcon, { backgroundColor: `${type.color}1A` }]}>
          <MaterialIcon name={type.icon} size={22} color={type.color} />
        </View>
        <View style={styles.flex}>
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
        <View style={styles.verified}>
          <MaterialIcon name="verified" size={14} color="#4CAF50" />
          <AppText style={styles.verifiedText}>Verified Resource</AppText>
        </View>
      ) : null}
      {resource.location || resource.address ? (
        <View style={styles.row}>
          <MaterialIcon name="location_on" size={16} color={colors.textSecondary} />
          <AppText variant="bodySmall" secondary style={styles.flex}>
            {resource.address ?? resource.location}
          </AppText>
        </View>
      ) : null}
      <View style={styles.actions}>
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
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>
      <MaterialIcon name={icon} size={16} color={brand.headerPink} />
      <AppText variant="bodySmall" color={brand.headerPink} style={styles.actionText}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
