import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActionSheetIOS, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { userProfilePictureUrl } from '@/api/auth';
import { pickProfilePhoto } from '@/api/profilePicture';
import { FormTextField } from '@/components/account/FormTextField';
import {
  Button,
  ListRow,
  PickerRow,
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

// Edit profile (redesign Phase 6, a sheet since Phase 18): photo, name, age and gender.

const NOT_SET = 'not-set';

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

  const removePhoto = () => {
    setNewPhotoUri(null);
    setPhotoUrl(null);
  };

  // iOS gets its own action sheet; Android and the web get the app's sheet.
  const openPhotoChoices = () => {
    if (Platform.OS !== 'ios') {
      setChoosingPhoto(true);
      return;
    }
    const options = [
      'Take photo',
      'Choose photo',
      ...(shownPhoto ? ['Remove photo'] : []),
      'Cancel',
    ];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Profile photo',
        options,
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: shownPhoto ? 2 : undefined,
      },
      (index) => {
        if (index === 0) void choosePhoto('camera');
        if (index === 1) void choosePhoto('library');
        if (index === 2 && shownPhoto) removePhoto();
      },
    );
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
        sheet={{
          title: 'Edit profile',
          onCancel: back,
          done: { label: 'Done', onPress: onSubmit, loading: update.isPending },
        }}>
        <View style={styles.photoBlock}>
          <View style={[styles.photo, { backgroundColor: palette.raised }]}>
            {shownPhoto ? (
              <Image source={{ uri: shownPhoto }} style={styles.fill} contentFit="cover" />
            ) : (
              <Text variant="title" tone="action">
                {initials(fullName || null)}
              </Text>
            )}
          </View>
          <Button
            title={shownPhoto ? 'Edit photo' : 'Add photo'}
            variant="quiet"
            small
            fullWidth={false}
            onPress={openPhotoChoices}
          />
        </View>

        <Section>
          <FormTextField
            grouped
            control={control}
            name="fullName"
            label="Your name"
            autoComplete="name"
          />
          <TextField grouped label="Email" value={user?.email ?? ''} editable={false} />
        </Section>
        <Section>
          <FormTextField
            grouped
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
              <PickerRow
                label="Gender"
                value={field.value ?? NOT_SET}
                onChange={(value) => field.onChange(value === NOT_SET ? null : value)}
                options={[
                  { value: NOT_SET, label: 'Not set' },
                  ...PROFILE_GENDER_OPTIONS.map((option) => ({ value: option, label: option })),
                ]}
              />
            )}
          />
        </Section>
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
              removePhoto();
            }}
          />
        ) : null}
      </Sheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%', height: '100%' },
  photoBlock: { alignItems: 'center', gap: space.xs },
  photo: {
    width: 104,
    height: 104,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
