# Supabase Storage Setup for Profile Pictures

## ⚠️ REQUIRED: Quick Setup Steps

**You must complete these steps before users can upload profile pictures!**

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: OncoSense project
3. **Navigate to Storage** (in the left sidebar)
4. **Click "New bucket"** button
5. **Create bucket with these settings**:
   - Name: `avatars`
   - Public bucket: ✅ **MUST BE CHECKED** (Enable "Public bucket")
   - Click "Create bucket"
6. **Done!** The app will now work for profile picture uploads

---

## Detailed Setup Instructions

To enable profile picture uploads, you need to create a storage bucket in your Supabase project:

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Enabled (so profile pictures are publicly accessible)
   - **File size limit**: 1 MB (optional, but recommended)
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg` (optional)

### 2. Set Storage Policies (Optional but Recommended)

To allow users to upload and manage their own profile pictures:

#### Policy 1: Allow users to upload their own profile pictures
```sql
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'profile_pictures'
  AND auth.uid()::text = (storage.filename(name))
);
```

#### Policy 2: Allow users to update their own profile pictures
```sql
CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'profile_pictures'
);
```

#### Policy 3: Allow public access to view profile pictures
```sql
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Policy 4: Allow users to delete their own profile pictures
```sql
CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'profile_pictures'
);
```

### 3. Verify Setup

After creating the bucket and policies:

1. Test uploading a profile picture from the app
2. Verify the image is stored in `avatars/profile_pictures/`
3. Check that the public URL is accessible
4. Confirm the URL is saved in user metadata as `profile_picture_url`

## Features Implemented

✅ **Image Selection**: Users can choose from gallery or take a photo
✅ **Image Upload**: Images are uploaded to Supabase Storage
✅ **Image Display**: Profile pictures are shown in both profile and edit screens
✅ **Remove Photo**: Users can remove their profile picture
✅ **Error Handling**: Proper error messages for failed uploads
✅ **Image Optimization**: Images are resized to 512x512 and compressed to 75% quality

## File Structure

```
avatars/
└── profile_pictures/
    ├── profile_<user_id_1>.jpg
    ├── profile_<user_id_2>.jpg
    └── ...
```

## User Metadata

Profile picture URLs are stored in user metadata:
```json
{
  "full_name": "John Doe",
  "age": 30,
  "gender": "Male",
  "profile_picture_url": "https://your-project.supabase.co/storage/v1/object/public/avatars/profile_pictures/profile_<user_id>.jpg"
}
```
