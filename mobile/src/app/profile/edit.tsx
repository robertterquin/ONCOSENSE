import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { userProfilePictureUrl } from '@/api/auth';
import { pickProfilePhoto } from '@/api/profilePicture';
import { FormTextField } from '@/components/account/FormTextField';
import {
  BottomActionBar,
  Button,
  Chip,
  Icon,
  ListRow,
  Screen,
  Section,
  Sheet,
  Text,
  TextField,
} from '@/components/ui';
import {
  editProfileSchema,
  PROFILE_GENDER_OPTIONS,
  type EditProfileForm,
} from '@/constants/validation';
import { useUpdateProfile } from '@/hooks/useAuth';
import { initials } from '@/lib/community';
import { useUser } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { radii, space } from '@/theme/tokens';
import { useDesign } from '@/theme/useTheme';

// Edit profile (redesign Phase 6): photo, name, age and gender. Behavior unchanged.

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

export default function EditProfileScreen() {
  const user = useUser();
  const { palette } = useDesign();
  const update = useUpdateProfile();
  const metadata = user?.user_metadata ?? {};
  const [photoUrl, setPhotoUrl] = useState<string | null>(userProfilePictureUrl(user));
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [choosingPhoto, setChoosingPhoto] = useState(false);
  const { control, handleSubmit } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: typeof metadata.full_name === 'string' ? metadata.full_name : '',
      age: metadata.age != null ? String(metadata.age) : '',
      gender: typeof metadata.gender === 'string' ? metadata.gender : null,
    },
  });
  const shownPhoto = newPhotoUri ?? photoUrl;
  const fullName = useWatch({ control, name: 'fullName' });

  const choosePhoto = async (source: 'library' | 'camera') => {
    setChoosingPhoto(false);
    try {
      const uri = await pickProfilePhoto(source);
      if (uri) setNewPhotoUri(uri);
    } catch (error) {
      showToast(
        `Couldn't ${source === 'camera' ? 'take a photo' : 'open your photos'}: ${(error as Error).message}`,
        'error',
      );
    }
  };

  const onSubmit = handleSubmit((form) =>
    update.mutate(
      {
        fullName: form.fullName.trim(),
        age: form.age.trim() ? Number(form.age) : null,
        gender: form.gender,
        newPhotoUri,
        currentPhotoUrl: photoUrl,
      },
      {
        onSuccess: () => {
          showToast('Profile saved', 'success');
          back();
        },
        onError: (error) => showToast(`Couldn't save: ${error.message}`, 'error'),
      },
    ),
  );

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        back={{ label: 'Profile', onPress: back }}
        title="Edit profile"
        bottomBar={
          <BottomActionBar>
            <Button title="Save" loading={update.isPending} onPress={onSubmit} />
          </BottomActionBar>
        }>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={shownPhoto ? 'Change or remove photo' : 'Add a photo'}
          onPress={() => setChoosingPhoto(true)}
          style={styles.photoWrap}>
          <View style={[styles.photo, { backgroundColor: palette.raised }]}>
            {shownPhoto ? (
              <Image source={{ uri: shownPhoto }} style={styles.fill} contentFit="cover" />
            ) : (
              <Text variant="title" tone="action">
                {initials(fullName || null)}
              </Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: palette.action }]}>
            <Icon name="camera" size={18} tone="onAction" />
          </View>
        </Pressable>

        <FormTextField control={control} name="fullName" label="Your name" autoComplete="name" />
        <TextField label="Email" value={user?.email ?? ''} editable={false} />
        <FormTextField
          control={control}
          name="age"
          label="Age (optional)"
          keyboardType="number-pad"
          maxLength={3}
        />
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Section title="Gender (optional)" look="plain">
              <View style={styles.chips} accessibilityRole="radiogroup">
                {PROFILE_GENDER_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    kind="radio"
                    label={option}
                    selected={field.value === option}
                    onPress={() => field.onChange(field.value === option ? null : option)}
                  />
                ))}
              </View>
            </Section>
          )}
        />
      </Screen>

      <Sheet visible={choosingPhoto} onClose={() => setChoosingPhoto(false)} title="Profile photo">
        <ListRow
          icon="image"
          title="Choose from your photos"
          onPress={() => choosePhoto('library')}
        />
        {Platform.OS === 'web' ? null : (
          <ListRow icon="camera" title="Take a photo" onPress={() => choosePhoto('camera')} />
        )}
        {shownPhoto ? (
          <ListRow
            icon="trash"
            title="Remove photo"
            onPress={() => {
              setChoosingPhoto(false);
              setNewPhotoUri(null);
              setPhotoUrl(null);
            }}
          />
        ) : null}
      </Sheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%', height: '100%' },
  photoWrap: { alignSelf: 'center' },
  photo: {
    width: 112,
    height: 112,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
