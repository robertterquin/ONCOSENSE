import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { userProfilePictureUrl } from '@/api/auth';
import { pickProfilePhoto } from '@/api/profilePicture';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { InputField } from '@/components/InputField';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Screen } from '@/components/Screen';
import {
  editProfileSchema,
  PROFILE_GENDER_OPTIONS,
  type EditProfileForm,
} from '@/constants/validation';
import { useUpdateProfile } from '@/hooks/useAuth';
import { useUser } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { brand } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

// Port of lib/screens/profile/edit_profile_screen.dart

export default function EditProfileScreen() {
  const user = useUser();
  const { colors, isDark } = useTheme();
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

  const choosePhoto = async (source: 'library' | 'camera') => {
    setChoosingPhoto(false);
    try {
      const uri = await pickProfilePhoto(source);
      if (uri) setNewPhotoUri(uri);
    } catch (error) {
      const action = source === 'camera' ? 'take photo' : 'pick image';
      showToast(`Failed to ${action}: ${(error as Error).message}`, 'error');
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
          showToast('Profile updated successfully!', 'success');
          router.back();
        },
        onError: (error) => showToast(`Failed to update profile: ${error.message}`, 'error'),
      },
    ),
  );

  const shownPhoto = newPhotoUri ?? photoUrl;
  const hasPhoto = !!shownPhoto;

  return (
    <Screen
      background="surface"
      header={
        <AppHeader
          title="Edit Profile"
          subtitle="Update your personal information"
          showBackButton
        />
      }>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change profile picture"
        onPress={() => setChoosingPhoto(true)}
        style={styles.photoWrap}>
        <View
          style={[
            styles.photo,
            { backgroundColor: hasPhoto ? brand.headerPink : isDark ? colors.card : '#EEEEEE' },
          ]}>
          {shownPhoto ? (
            <Image source={{ uri: shownPhoto }} style={styles.photoImage} contentFit="cover" />
          ) : (
            <MaterialIcon name="person" size={56} color="#9E9E9E" />
          )}
        </View>
        <View style={styles.cameraBadge}>
          <MaterialIcon name="camera_alt" size={18} color={brand.white} />
        </View>
      </Pressable>
      <AppText variant="bodySmall" secondary style={styles.centered}>
        Tap to change profile picture
      </AppText>

      <FormField
        control={control}
        name="fullName"
        label="Full Name"
        placeholder="Enter your full name"
        autoComplete="name"
      />
      <InputField
        label="Email Address"
        value={user?.email ?? ''}
        placeholder="Your email address"
        editable={false}
      />
      <FormField
        control={control}
        name="age"
        label="Age (Optional)"
        placeholder="Enter your age"
        keyboardType="number-pad"
        maxLength={3}
      />
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <View style={styles.gender}>
            <AppText variant="label">Gender (Optional)</AppText>
            <View style={styles.chips}>
              {PROFILE_GENDER_OPTIONS.map((option) => {
                const selected = field.value === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => field.onChange(selected ? null : option)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? brand.headerPink
                          : isDark
                            ? colors.card
                            : '#F5F5F5',
                      },
                    ]}>
                    <AppText color={selected ? brand.white : colors.text}>{option}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      />

      <Button title="Save Changes" onPress={onSubmit} loading={update.isPending} />

      <PhotoSourceSheet
        visible={choosingPhoto}
        canRemove={hasPhoto}
        onClose={() => setChoosingPhoto(false)}
        onPick={choosePhoto}
        onRemove={() => {
          setChoosingPhoto(false);
          setNewPhotoUri(null);
          setPhotoUrl(null);
        }}
      />
    </Screen>
  );
}

function SheetOption({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.option}>
      <MaterialIcon name={icon} size={24} color={color} />
      <AppText variant="bodyLarge">{label}</AppText>
    </Pressable>
  );
}

function PhotoSourceSheet({
  visible,
  canRemove,
  onClose,
  onPick,
  onRemove,
}: {
  visible: boolean;
  canRemove: boolean;
  onClose: () => void;
  onPick: (source: 'library' | 'camera') => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, paddingBottom: 16 + insets.bottom },
          ]}>
          <AppText variant="titleMedium" style={styles.sheetTitle}>
            Choose Profile Picture
          </AppText>
          <SheetOption
            icon="photo_library"
            label="Choose from Gallery"
            color={brand.headerPink}
            onPress={() => onPick('library')}
          />
          <SheetOption
            icon="camera_alt"
            label="Take a Photo"
            color={brand.headerPink}
            onPress={() => onPick('camera')}
          />
          {canRemove ? (
            <SheetOption icon="delete" label="Remove Photo" color="#F44336" onPress={onRemove} />
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centered: { textAlign: 'center', marginTop: -8 },
  photoWrap: { alignSelf: 'center', marginTop: 8 },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: { width: '100%', height: '100%' },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: brand.white,
    backgroundColor: brand.headerPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gender: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 4,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  sheetTitle: { textAlign: 'center', marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
});
