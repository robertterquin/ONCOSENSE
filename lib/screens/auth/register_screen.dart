import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cancerapp/utils/constants.dart';
import 'package:cancerapp/utils/routes.dart';
import 'package:cancerapp/services/supabase_service.dart';
import 'package:cancerapp/services/journey_service.dart';
import 'package:cancerapp/widgets/modern_back_button.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'widgets/input_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _ageController = TextEditingController();
  
  String? _selectedGender;
  bool _termsAccepted = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _ageController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    if (value == null || value.isEmpty) {
      return AppConstants.nameEmptyError;
    }
    if (value.length < AppConstants.minNameLength) {
      return AppConstants.nameShortError;
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return AppConstants.emailEmptyError;
    }
    if (!AppConstants.emailRegex.hasMatch(value)) {
      return AppConstants.emailInvalidError;
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return AppConstants.passwordEmptyError;
    }
    if (value.length < AppConstants.minPasswordLength) {
      return AppConstants.passwordShortError;
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != _passwordController.text) {
      return AppConstants.passwordMismatchError;
    }
    return null;
  }

  String? _validateAge(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Age is optional
    }
    final age = int.tryParse(value);
    if (age == null) {
      return 'Please enter a valid age';
    }
    if (age < AppConstants.minAge || age > AppConstants.maxAge) {
      return 'Age must be between ${AppConstants.minAge} and ${AppConstants.maxAge}';
    }
    return null;
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_termsAccepted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please accept the terms and conditions'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final supabase = SupabaseService();
      
      // Prepare user metadata
      final metadata = <String, dynamic>{
        'full_name': _nameController.text.trim(),
      };
      
      if (_ageController.text.isNotEmpty) {
        metadata['age'] = int.parse(_ageController.text);
      }
      
      if (_selectedGender != null) {
        metadata['gender'] = _selectedGender;
      }
      
      await supabase.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        metadata: metadata,
      );

      if (mounted) {
        print('🔍 Registration successful, checking user status...');
        print('🔍 Current user: ${supabase.currentUser?.email}');
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Welcome to OncoSense!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
        
        // Small delay to ensure user session is established
        await Future.delayed(const Duration(milliseconds: 500));
        
        // Initialize journey service
        final journeyService = JourneyService();
        await journeyService.initialize();
        
        print('🔍 Journey started: ${journeyService.journeyStarted}');
        print('🔍 Navigating to journey setup...');
        
        // Always go to journey setup for new users
        Navigator.pushReplacementNamed(context, AppRoutes.journeySetup);
      }
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('An error occurred: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: const ModernBackButtonLight(),
        title: const Text(
          'Create Account',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Full Name
              InputField(
                controller: _nameController,
                label: 'Full Name',
                hint: 'Enter your full name',
                keyboardType: TextInputType.name,
                prefixIcon: const Icon(Icons.person_outline),
                validator: _validateName,
              ),

              const SizedBox(height: 16.0),

              // Email
              InputField(
                controller: _emailController,
                label: 'Email',
                hint: 'Enter your email',
                keyboardType: TextInputType.emailAddress,
                prefixIcon: const Icon(Icons.email_outlined),
                validator: _validateEmail,
              ),

              const SizedBox(height: 16.0),

              // Password
              InputField(
                controller: _passwordController,
                label: 'Password',
                hint: 'At least 6 characters',
                isPassword: true,
                prefixIcon: const Icon(Icons.lock_outline),
                validator: _validatePassword,
              ),

              const SizedBox(height: 16.0),

              // Confirm Password
              InputField(
                controller: _confirmPasswordController,
                label: 'Confirm Password',
                hint: 'Re-enter your password',
                isPassword: true,
                prefixIcon: const Icon(Icons.lock_outline),
                validator: _validateConfirmPassword,
              ),

              const SizedBox(height: 16.0),

              // Age (Optional)
              InputField(
                controller: _ageController,
                label: 'Age (Optional)',
                hint: 'Enter your age',
                keyboardType: TextInputType.number,
                prefixIcon: const Icon(Icons.calendar_today_outlined),
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(3),
                ],
                validator: _validateAge,
              ),

              const SizedBox(height: 16.0),

              // Gender (Optional)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Gender (Optional)',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF424242),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonFormField<String>(
                      value: _selectedGender,
                      decoration: InputDecoration(
                        hintText: 'Select your gender',
                        hintStyle: TextStyle(
                          color: Color(0xFF9E9E9E),
                          fontSize: 14,
                        ),
                        prefixIcon: Icon(Icons.wc_outlined, color: Color(0xFF757575)),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      ),
                      dropdownColor: Colors.white,
                      items: ['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((gender) {
                        return DropdownMenuItem(
                          value: gender,
                          child: Text(gender),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedGender = value;
                        });
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24.0),

              // Terms & Privacy Checkbox
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: Checkbox(
                      value: _termsAccepted,
                      onChanged: (value) {
                        setState(() {
                          _termsAccepted = value ?? false;
                        });
                      },
                      activeColor: Color(0xFFD81B60),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _termsAccepted = !_termsAccepted;
                        });
                      },
                      child: RichText(
                        text: TextSpan(
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF616161),
                            height: 1.4,
                          ),
                          children: const [
                            TextSpan(text: 'I agree to the '),
                            TextSpan(
                              text: 'Terms & Conditions',
                              style: TextStyle(
                                color: Color(0xFFD81B60),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(text: ' and '),
                            TextSpan(
                              text: 'Privacy Policy',
                              style: TextStyle(
                                color: Color(0xFFD81B60),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32.0),

              // Register Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFD81B60),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                    elevation: 0,
                    disabledBackgroundColor: Color(0xFFD81B60).withOpacity(0.6),
                  ),
                  child: _isLoading
                      ? SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'Register',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 16.0),

              // Login Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Already have an account? ',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF616161),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, AppRoutes.login);
                    },
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size(50, 30),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text(
                      'Login',
                      style: TextStyle(
                        color: Color(0xFFD81B60),
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
