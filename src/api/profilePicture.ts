import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

import { ApiError, check } from './errors';

// Profile pictures, as in edit_profile_screen.dart: one JPEG per user at
// `images/profile_pictures/profile_<userId>.jpg`, its public URL saved in user metadata.

const BUCKET = 'images';

/** Lets the user pick or take a square photo. Returns its local URI, or null if cancelled. */
export async function pickProfilePhoto(source: 'library' | 'camera'): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
  };
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new ApiError('Camera permission is needed to take a photo.');
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : result.assets[0].uri;
}

/**
 * Shrinks the photo to 512px (like Flutter's maxWidth 512), uploads it and returns its
 * public URL with a cache-busting timestamp. Throws if anything fails, so the old photo
 * is kept (Flutter cleared the photo when an upload failed).
 */
export async function uploadProfilePicture(userId: string, localUri: string): Promise<string> {
  const rendered = await ImageManipulator.manipulate(localUri).resize({ width: 512 }).renderAsync();
  const resized = await rendered.saveAsync({ compress: 0.75, format: SaveFormat.JPEG });
  const bytes = await (await fetch(resized.uri)).arrayBuffer();

  const path = `profile_pictures/profile_${userId}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
  check(error, 'Failed to upload image');

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
