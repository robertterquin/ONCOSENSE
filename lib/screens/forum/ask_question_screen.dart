import 'package:flutter/material.dart';
import 'package:cancerapp/models/question.dart';
import 'package:cancerapp/services/forum_service.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';

class AskQuestionScreen extends StatefulWidget {
  const AskQuestionScreen({super.key});

  @override
  State<AskQuestionScreen> createState() => _AskQuestionScreenState();
}

class _AskQuestionScreenState extends State<AskQuestionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _forumService = ForumService();

  String _selectedCategory = ForumCategory.symptoms;
  bool _isAnonymous = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submitQuestion() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      await _forumService.createQuestion(
        title: _titleController.text.trim(),
        content: _contentController.text.trim(),
        category: _selectedCategory,
        isAnonymous: _isAnonymous,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Question posted successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // Return true to indicate success
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Error posting question: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      body: CustomScrollView(
        slivers: [
          const CustomAppHeader(
            title: 'Ask a Question',
            subtitle: 'Share your concerns with the community',
            showBackButton: true,
          ),
          SliverToBoxAdapter(
            child: Form(
              key: _formKey,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category Selection
                    Text(
                      'Category',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: ForumCategory.all.map((category) {
                  final isSelected = category == _selectedCategory;
                  return ChoiceChip(
                    label: Text(
                      '${ForumCategory.getIcon(category)} $category',
                    ),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedCategory = category);
                      }
                    },
                    selectedColor: const Color(0xFFFCE4EC),
                    backgroundColor: AppTheme.getCardColor(context),
                    labelStyle: TextStyle(
                      color: isSelected
                          ? const Color(0xFFD81B60)
                          : AppTheme.getSecondaryTextColor(context),
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                    side: BorderSide(
                      color: isSelected
                          ? const Color(0xFFD81B60)
                          : AppTheme.getDividerColor(context),
                    ),
                  );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),

                    // Title Field
                    Text(
                      'Title',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _titleController,
                      decoration: InputDecoration(
                        hintText: 'What would you like to know?',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFD81B60),
                            width: 2,
                          ),
                        ),
                      ),
                      maxLength: 200,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter a title';
                        }
                        if (value.trim().length < 10) {
                          return 'Title must be at least 10 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Content Field
                    Text(
                      'Details',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _contentController,
                      decoration: InputDecoration(
                        hintText:
                            'Provide more details to help others understand your question...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFD81B60),
                            width: 2,
                          ),
                        ),
                        alignLabelWithHint: true,
                      ),
                      maxLines: 8,
                      maxLength: 2000,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please provide details';
                        }
                        if (value.trim().length < 20) {
                          return 'Details must be at least 20 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Anonymous Toggle
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.isDarkMode(context) ? AppTheme.getCardColor(context) : const Color(0xFFF5F5F5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.visibility_off_outlined,
                            color: AppTheme.getSecondaryTextColor(context),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Post Anonymously',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.getTextColor(context),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Your name won\'t be shown',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppTheme.getSecondaryTextColor(context),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Switch(
                            value: _isAnonymous,
                            onChanged: (value) {
                              setState(() => _isAnonymous = value);
                            },
                            activeColor: const Color(0xFFD81B60),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Guidelines
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.isDarkMode(context) ? const Color(0xFF3D1F2B) : const Color(0xFFFCE4EC),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.info_outline,
                                color: Color(0xFFD81B60),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'Community Guidelines',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFD81B60),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            '• Be respectful and supportive\n'
                            '• Don\'t share personal medical information\n'
                            '• Seek professional medical advice\n'
                            '• No spam or promotional content',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.getSecondaryTextColor(context),
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitQuestion,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD81B60),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Post Question',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
