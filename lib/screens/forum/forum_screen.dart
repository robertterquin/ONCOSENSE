import 'package:flutter/material.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';

class ForumScreen extends StatelessWidget {
  const ForumScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: CustomScrollView(
          clipBehavior: Clip.antiAlias,
          slivers: [
            const CustomAppHeader(
              title: 'Q&A Forum',
              subtitle: 'Ask questions, share experiences',
            ),
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // TODO: Navigate to ask question screen
                      },
                      icon: const Icon(Icons.add),
                      label: const Text('Ask a Question'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD81B60),
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search discussions...',
                        prefixIcon: const Icon(Icons.search),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Categories',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Wrap(
                      spacing: 8,
                      children: [
                        'Symptoms',
                        'Diagnosis',
                        'Mental Health',
                        'Lifestyle',
                        'Family Support',
                      ]
                          .map(
                            (category) => FilterChip(
                              label: Text(category),
                              onSelected: (_) {},
                              backgroundColor: Colors.white,
                              side: const BorderSide(
                                color: Color(0xFFE0E0E0),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Recent Discussions',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: 5,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        return _buildDiscussionCard();
                      },
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiscussionCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE0E0E0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFFCE4EC),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Symptoms',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFFD81B60),
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'What are the early warning signs I should watch for?',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF212121),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'I have been experiencing some unusual symptoms and I\'m worried...',
            style: TextStyle(
              fontSize: 12,
              color: Color(0xFF757575),
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 14, color: Color(0xFF9E9E9E)),
              const SizedBox(width: 4),
              const Text(
                'Anonymous',
                style: TextStyle(
                  fontSize: 11,
                  color: Color(0xFF9E9E9E),
                ),
              ),
              const SizedBox(width: 16),
              const Icon(Icons.message_outlined, size: 14, color: Color(0xFF9E9E9E)),
              const SizedBox(width: 4),
              const Text(
                '12 answers',
                style: TextStyle(
                  fontSize: 11,
                  color: Color(0xFF9E9E9E),
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFCE4EC),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.thumb_up_outlined, size: 12, color: Color(0xFFD81B60)),
                    SizedBox(width: 2),
                    Text(
                      '5',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFFD81B60),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
