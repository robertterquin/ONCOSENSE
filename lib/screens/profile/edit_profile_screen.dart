import 'package:flutter/material.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:typed_data';
import 'package:cancerapp/utils/theme.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final supabase = SupabaseService();
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _ageController;
  
  String? _selectedGender;
  bool _isLoading = false;
  bool _isSaving = false;
  String? _profilePictureUrl;
  XFile? _selectedImage;
  final ImagePicker _imagePicker = ImagePicker();

  final List<String> _genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _ageController = TextEditingController();
    _loadUserData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _ageController.dispose();
    super.dispose();
  }

  void _loadUserData() {
    setState(() => _isLoading = true);
    
    final user = supabase.currentUser;
    if (user != null) {
      _nameController.text = user.userMetadata?['full_name'] ?? '';
      _emailController.text = user.email ?? '';
      _ageController.text = user.userMetadata?['age']?.toString() ?? '';
      _selectedGender = user.userMetadata?['gender'];
      _profilePictureUrl = user.userMetadata?['profile_picture_url'];
    }
    
    setState(() => _isLoading = false);
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSaving = true);

    try {
      final user = supabase.currentUser;
      if (user != null) {
        String? uploadedImageUrl = _profilePictureUrl;
        
        // Upload new profile picture if selected
        if (_selectedImage != null) {
          uploadedImageUrl = await _uploadProfilePicture(user.id);
        }
        
        // Update user metadata
        await supabase.client.auth.updateUser(
          UserAttributes(
            data: {
              'full_name': _nameController.text.trim(),
              'age': _ageController.text.isNotEmpty ? int.tryParse(_ageController.text) : null,
              'gender': _selectedGender,
              'profile_picture_url': uploadedImageUrl,
            },
          ),
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profile updated successfully!'),
              backgroundColor: Color(0xFF4CAF50),
            ),
          );
          Navigator.pop(context, true); // Return true to indicate changes were made
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update profile: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  Future<void> _pickImage() async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 75,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImage = pickedFile;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to pick image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _showImageSourceDialog() async {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Choose Profile Picture',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.photo_library, color: Color(0xFFD81B60)),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage();
                },
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt, color: Color(0xFFD81B60)),
                title: const Text('Take a Photo'),
                onTap: () {
                  Navigator.pop(context);
                  _takePhoto();
                },
              ),
              if (_profilePictureUrl != null || _selectedImage != null)
                ListTile(
                  leading: const Icon(Icons.delete, color: Colors.red),
                  title: const Text('Remove Photo'),
                  onTap: () {
                    Navigator.pop(context);
                    _removePhoto();
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _takePhoto() async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 75,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImage = pickedFile;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to take photo: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _removePhoto() {
    setState(() {
      _selectedImage = null;
      _profilePictureUrl = null;
    });
  }

  Future<String?> _uploadProfilePicture(String userId) async {
    if (_selectedImage == null) return null;

    try {
      final fileName = 'profile_$userId.jpg';
      final filePath = 'profile_pictures/$fileName';

      // Read image bytes
      final imageBytes = await _selectedImage!.readAsBytes();

      // Upload to Supabase Storage
      await supabase.client.storage
          .from('images')
          .uploadBinary(
            filePath,
            imageBytes,
            fileOptions: const FileOptions(upsert: true),
          );

      // Get public URL with cache-busting timestamp
      final publicUrl = supabase.client.storage
          .from('images')
          .getPublicUrl(filePath);
      
      // Add timestamp to prevent caching issues
      final urlWithTimestamp = '$publicUrl?t=${DateTime.now().millisecondsSinceEpoch}';

      return urlWithTimestamp;
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Failed to upload image';
        
        // Check if it's a bucket not found error
        if (e.toString().contains('Bucket not found') || 
            e.toString().contains('404')) {
          errorMessage = 'Storage bucket not configured. Please create an "images" bucket in Supabase Storage (see STORAGE_SETUP.md)';
        } else if (e.toString().contains('row-level security policy') || 
                   e.toString().contains('403') ||
                   e.toString().contains('Unauthorized')) {
          errorMessage = 'Storage permissions error. Please enable "Public bucket" or add upload policies for the "images" bucket in Supabase';
        } else {
          errorMessage = 'Failed to upload image: ${e.toString()}';
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFD81B60),
                ),
              )
            : CustomScrollView(
                slivers: [
                  // App Bar
                  const CustomAppHeader(
                    title: 'Edit Profile',
                    subtitle: 'Update your personal information',
                    showBackButton: true,
                  ),

                  // Content
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 8),

                            // Profile Picture Section
                            Center(
                              child: GestureDetector(
                                onTap: _showImageSourceDialog,
                                child: Stack(
                                  children: [
                                    Container(
                                      width: 100,
                                      height: 100,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: (_selectedImage == null && _profilePictureUrl == null)
                                            ? const LinearGradient(
                                                begin: Alignment.topLeft,
                                                end: Alignment.bottomRight,
                                                colors: [
                                                  Color(0xFFD81B60),
                                                  Color(0xFFE91E63),
                                                ],
                                              )
                                            : null,
                                        color: (_selectedImage != null || _profilePictureUrl != null) 
                                            ? Colors.grey[200] 
                                            : null,
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFFD81B60).withOpacity(0.3),
                                            blurRadius: 15,
                                            offset: const Offset(0, 8),
                                          ),
                                        ],
                                      ),
                                      child: ClipOval(
                                        child: _selectedImage != null
                                            ? FutureBuilder<Uint8List>(
                                                future: _selectedImage!.readAsBytes(),
                                                builder: (context, snapshot) {
                                                  if (snapshot.hasData) {
                                                    return Image.memory(
                                                      snapshot.data!,
                                                      fit: BoxFit.cover,
                                                    );
                                                  }
                                                  return const Center(
                                                    child: CircularProgressIndicator(
                                                      color: Color(0xFFD81B60),
                                                      strokeWidth: 2,
                                                    ),
                                                  );
                                                },
                                              )
                                            : _profilePictureUrl != null
                                                ? Image.network(
                                                    _profilePictureUrl!,
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (context, error, stackTrace) {
                                                      return Center(
                                                        child: Text(
                                                          _nameController.text.isNotEmpty 
                                                              ? _nameController.text[0].toUpperCase() 
                                                              : 'U',
                                                          style: const TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 40,
                                                            fontWeight: FontWeight.bold,
                                                          ),
                                                        ),
                                                      );
                                                    },
                                                  )
                                                : Center(
                                                    child: Text(
                                                      _nameController.text.isNotEmpty 
                                                          ? _nameController.text[0].toUpperCase() 
                                                          : 'U',
                                                      style: const TextStyle(
                                                        color: Colors.white,
                                                        fontSize: 40,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ),
                                      ),
                                    ),
                                    Positioned(
                                      bottom: 0,
                                      right: 0,
                                      child: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          shape: BoxShape.circle,
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withOpacity(0.1),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: const Icon(
                                          Icons.camera_alt,
                                          color: Color(0xFFD81B60),
                                          size: 20,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(height: 32),

                            Text(
                              'Personal Information',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.getSecondaryTextColor(context),
                                letterSpacing: 0.5,
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Full Name Field
                            _buildInputField(
                              controller: _nameController,
                              label: 'Full Name',
                              icon: Icons.person_outline,
                              hint: 'Enter your full name',
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Please enter your name';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 16),

                            // Email Field (Read-only)
                            _buildInputField(
                              controller: _emailController,
                              label: 'Email Address',
                              icon: Icons.email_outlined,
                              hint: 'Your email address',
                              enabled: false,
                              helperText: 'Email cannot be changed',
                            ),

                            const SizedBox(height: 16),

                            // Age Field
                            _buildInputField(
                              controller: _ageController,
                              label: 'Age (Optional)',
                              icon: Icons.cake_outlined,
                              hint: 'Enter your age',
                              keyboardType: TextInputType.number,
                              validator: (value) {
                                if (value != null && value.isNotEmpty) {
                                  final age = int.tryParse(value);
                                  if (age == null || age < 1 || age > 150) {
                                    return 'Please enter a valid age';
                                  }
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 16),

                            // Gender Field
                            _buildGenderField(),

                            const SizedBox(height: 32),

                            // Save Button
                            SizedBox(
                              width: double.infinity,
                              height: 56,
                              child: ElevatedButton(
                                onPressed: _isSaving ? null : _saveProfile,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFD81B60),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  elevation: 0,
                                  shadowColor: const Color(0xFFD81B60).withOpacity(0.3),
                                ),
                                child: _isSaving
                                    ? const SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : const Text(
                                        'Save Changes',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Cancel Button
                            SizedBox(
                              width: double.infinity,
                              height: 56,
                              child: OutlinedButton(
                                onPressed: _isSaving ? null : () => Navigator.pop(context),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFFD81B60),
                                  side: const BorderSide(
                                    color: Color(0xFFD81B60),
                                    width: 1.5,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: const Text(
                                  'Cancel',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 32),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required String hint,
    bool enabled = true,
    String? helperText,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    final isDark = AppTheme.isDarkMode(context);
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.getCardColor(context),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextFormField(
        controller: controller,
        enabled: enabled,
        keyboardType: keyboardType,
        validator: validator,
        style: TextStyle(
          fontSize: 15,
          color: enabled ? AppTheme.getTextColor(context) : AppTheme.getSecondaryTextColor(context),
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          helperText: helperText,
          prefixIcon: Icon(
            icon,
            color: enabled ? const Color(0xFFD81B60) : AppTheme.getSecondaryTextColor(context),
            size: 22,
          ),
          labelStyle: TextStyle(
            color: enabled ? const Color(0xFFD81B60) : AppTheme.getSecondaryTextColor(context),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          hintStyle: TextStyle(
            color: AppTheme.getSecondaryTextColor(context),
            fontSize: 14,
          ),
          helperStyle: TextStyle(
            color: AppTheme.getSecondaryTextColor(context),
            fontSize: 12,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: Color(0xFFD81B60),
              width: 2,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: Colors.red,
              width: 2,
            ),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: Colors.red,
              width: 2,
            ),
          ),
          filled: true,
          fillColor: AppTheme.getCardColor(context),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }

  Widget _buildGenderField() {
    final isDark = AppTheme.isDarkMode(context);
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.getCardColor(context),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: DropdownButtonFormField<String>(
        value: _selectedGender,
        decoration: InputDecoration(
          labelText: 'Gender (Optional)',
          prefixIcon: const Icon(
            Icons.wc_outlined,
            color: Color(0xFFD81B60),
            size: 22,
          ),
          labelStyle: const TextStyle(
            color: Color(0xFFD81B60),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: Color(0xFFD81B60),
              width: 2,
            ),
          ),
          filled: true,
          fillColor: AppTheme.getCardColor(context),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
        items: _genderOptions.map((String gender) {
          return DropdownMenuItem<String>(
            value: gender,
            child: Text(
              gender,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: AppTheme.getTextColor(context),
              ),
            ),
          );
        }).toList(),
        onChanged: (String? newValue) {
          setState(() {
            _selectedGender = newValue;
          });
        },
        icon: const Icon(
          Icons.arrow_drop_down,
          color: Color(0xFFD81B60),
        ),
        dropdownColor: AppTheme.getCardColor(context),
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}
