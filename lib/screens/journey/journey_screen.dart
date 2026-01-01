import 'package:flutter/material.dart';
import 'package:cancerapp/services/journey_service.dart';
import 'package:cancerapp/models/journey_entry.dart';
import 'package:cancerapp/models/treatment.dart';
import 'package:cancerapp/models/milestone.dart';
import 'package:cancerapp/screens/journey/journey_setup_screen.dart';
import 'package:cancerapp/screens/journey/add_entry_screen.dart';
import 'package:cancerapp/screens/journey/add_treatment_screen.dart';
import 'package:cancerapp/utils/theme.dart';

class JourneyScreen extends StatefulWidget {
  const JourneyScreen({super.key});

  @override
  State<JourneyScreen> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends State<JourneyScreen> with SingleTickerProviderStateMixin {
  final JourneyService _journeyService = JourneyService();
  late TabController _tabController;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadJourneyData();
    _journeyService.addListener(_onJourneyDataChanged);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _journeyService.removeListener(_onJourneyDataChanged);
    super.dispose();
  }

  void _onJourneyDataChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _loadJourneyData() async {
    await _journeyService.initialize();
    await _journeyService.checkCancerFreeMilestones();
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final isDark = AppTheme.isDarkMode(context);

    if (_isLoading) {
      return Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFD81B60)),
        ),
      );
    }

    // Show setup screen if journey hasn't started (fallback for edge cases)
    if (!_journeyService.journeyStarted) {
      return const JourneySetupScreen();
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      extendBody: true,
      body: Column(
        children: [
          // Fixed Header
          Container(
            padding: EdgeInsets.only(
              top: topPadding + 12,
              left: 20,
              right: 20,
              bottom: 8,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFD81B60),
                  Color(0xFFE91E63),
                ],
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.auto_graph,
                      color: Colors.white,
                      size: 28,
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'My Journey',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    // Days cancer-free badge
                    if (_journeyService.cancerFreeStartDate != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.celebration,
                              color: Colors.white,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${_journeyService.daysCancerFree} days free',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Track your progress, celebrate milestones',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 16),
                // Tab Bar
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    indicator: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    labelColor: const Color(0xFFD81B60),
                    unselectedLabelColor: Colors.white,
                    labelStyle: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                    unselectedLabelStyle: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.normal,
                    ),
                    tabs: const [
                      Tab(text: 'Dashboard'),
                      Tab(text: 'Journal'),
                      Tab(text: 'Treatment'),
                      Tab(text: 'Milestones'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Tab Content
          Expanded(
            child: Container(
              color: AppTheme.getBackgroundColor(context),
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildDashboardTab(isDark),
                  _buildJournalTab(isDark),
                  _buildTreatmentTab(isDark),
                  _buildMilestonesTab(isDark),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddOptions(context),
        backgroundColor: const Color(0xFFD81B60),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  void _showAddOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.isDarkMode(context) ? AppTheme.darkCard : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Add to Journey',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 20),
            _buildAddOption(
              context,
              icon: Icons.edit_note,
              title: 'Daily Journal Entry',
              subtitle: 'Log your mood, pain, and symptoms',
              color: Colors.blue,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddEntryScreen()),
                );
              },
            ),
            const SizedBox(height: 12),
            _buildAddOption(
              context,
              icon: Icons.medical_services,
              title: 'New Treatment',
              subtitle: 'Add a new treatment to track',
              color: Colors.purple,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddTreatmentScreen()),
                );
              },
            ),
            const SizedBox(height: 12),
            _buildAddOption(
              context,
              icon: Icons.emoji_events,
              title: 'Custom Milestone',
              subtitle: 'Celebrate a personal achievement',
              color: Colors.orange,
              onTap: () {
                Navigator.pop(context);
                _showAddMilestoneDialog(context);
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildAddOption(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDark = AppTheme.isDarkMode(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: color),
          ],
        ),
      ),
    );
  }

  void _showAddMilestoneDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Milestone'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'Title',
                hintText: 'e.g., First chemo session complete!',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descController,
              decoration: const InputDecoration(
                labelText: 'Description (optional)',
                hintText: 'Add more details...',
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (titleController.text.isNotEmpty) {
                await _journeyService.addMilestone(Milestone(
                  id: '${DateTime.now().millisecondsSinceEpoch}_personal',
                  title: titleController.text,
                  description: descController.text.isEmpty 
                      ? 'Personal milestone achieved!' 
                      : descController.text,
                  type: MilestoneType.personal,
                  dateAchieved: DateTime.now(),
                ));
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('🎉 Milestone added!')),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD81B60),
            ),
            child: const Text('Add', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // =====================
  // Dashboard Tab
  // =====================

  Widget _buildDashboardTab(bool isDark) {
    final entries = _journeyService.entries;
    final todayEntry = _journeyService.getEntryForDate(DateTime.now());
    
    return Container(
      color: AppTheme.getBackgroundColor(context),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Quick Stats Row
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  isDark,
                  icon: Icons.local_fire_department,
                  iconColor: Colors.orange,
                  title: '${_journeyService.currentStreak}',
                  subtitle: 'Day Streak',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  isDark,
                  icon: Icons.emoji_events,
                  iconColor: Colors.amber,
                  title: '${_journeyService.milestones.length}',
                  subtitle: 'Milestones',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  isDark,
                  icon: Icons.edit_note,
                  iconColor: Colors.blue,
                  title: '${entries.length}',
                  subtitle: 'Entries',
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Today's Check-in
          _buildSectionHeader('Today\'s Check-in', isDark),
          const SizedBox(height: 12),
          if (todayEntry != null)
            _buildTodayEntryCard(todayEntry, isDark)
          else
            _buildNoEntryCard(isDark),

          const SizedBox(height: 24),

          // Weekly Mood Overview
          _buildSectionHeader('Weekly Overview', isDark),
          const SizedBox(height: 12),
          _buildWeeklyOverview(isDark),

          const SizedBox(height: 24),

          // Active Treatments
          if (_journeyService.activeTreatments.isNotEmpty) ...[
            _buildSectionHeader('Active Treatments', isDark),
            const SizedBox(height: 12),
            ..._journeyService.activeTreatments.take(2).map(
              (t) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildTreatmentProgressCard(t, isDark),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Recent Milestones
          if (_journeyService.milestones.isNotEmpty) ...[
            _buildSectionHeader('Recent Milestones', isDark),
            const SizedBox(height: 12),
            ..._journeyService.milestones.take(3).map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _buildMilestoneCard(m, isDark, compact: true),
              ),
            ),
          ],

          const SizedBox(height: 100), // Space for FAB
        ],
      ),
    )

    );

  }

  Widget _buildStatCard(bool isDark, {
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: iconColor, size: 28),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.getTextColor(context),
            ),
          ),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.white60 : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: AppTheme.getTextColor(context),
      ),
    );
  }

  Widget _buildTodayEntryCard(JourneyEntry entry, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(entry.moodEmoji, style: const TextStyle(fontSize: 32)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Feeling ${entry.moodLabel}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    Text(
                      'Pain: ${entry.painLevel}/10 • Energy: ${entry.energyLevel}/10',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? Colors.white60 : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.edit, size: 20),
                color: const Color(0xFFD81B60),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AddEntryScreen(existingEntry: entry),
                    ),
                  );
                },
              ),
            ],
          ),
          if (entry.symptoms.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: entry.symptoms.take(4).map((s) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  s,
                  style: const TextStyle(fontSize: 11, color: Colors.orange),
                ),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNoEntryCard(bool isDark) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const AddEntryScreen()),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFD81B60).withValues(alpha: 0.3),
            width: 2,
            strokeAlign: BorderSide.strokeAlignInside,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFD81B60).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.add_circle_outline,
                color: Color(0xFFD81B60),
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'How are you feeling today?',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                  Text(
                    'Tap to log your daily check-in',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white60 : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              color: Color(0xFFD81B60),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeeklyOverview(bool isDark) {
    final trendData = _journeyService.getMoodTrend(7);
    final days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(7, (index) {
              final data = index < trendData.length ? trendData[index] : null;
              final mood = data?['mood'] as int? ?? 0;
              final date = data?['date'] as DateTime?;
              final isToday = date != null && 
                  date.year == DateTime.now().year &&
                  date.month == DateTime.now().month &&
                  date.day == DateTime.now().day;
              
              return Column(
                children: [
                  Text(
                    days[(date?.weekday ?? 1) - 1],
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                      color: isToday 
                          ? const Color(0xFFD81B60) 
                          : (isDark ? Colors.white60 : Colors.grey),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: mood > 0 
                          ? _getMoodColor(mood).withValues(alpha: 0.2)
                          : (isDark ? Colors.white10 : Colors.grey.shade100),
                      shape: BoxShape.circle,
                      border: isToday ? Border.all(
                        color: const Color(0xFFD81B60),
                        width: 2,
                      ) : null,
                    ),
                    child: Center(
                      child: Text(
                        mood > 0 ? _getMoodEmoji(mood) : '—',
                        style: const TextStyle(fontSize: 16),
                      ),
                    ),
                  ),
                ],
              );
            }),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildOverviewStat(
                'Avg Mood',
                _journeyService.getAverageMood(7).toStringAsFixed(1),
                '/5',
                Colors.blue,
              ),
              _buildOverviewStat(
                'Avg Pain',
                _journeyService.getAveragePain(7).toStringAsFixed(1),
                '/10',
                Colors.orange,
              ),
              _buildOverviewStat(
                'Entries',
                '${trendData.where((d) => (d['mood'] as int) > 0).length}',
                '/7',
                Colors.green,
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildOverviewStat(String label, String value, String suffix, Color color) {
    return Column(
      children: [
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: value,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              TextSpan(
                text: suffix,
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.isDarkMode(context) ? Colors.white60 : Colors.grey,
                ),
              ),
            ],
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: AppTheme.isDarkMode(context) ? Colors.white60 : Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Color _getMoodColor(int mood) {
    switch (mood) {
      case 1: return Colors.red;
      case 2: return Colors.orange;
      case 3: return Colors.yellow.shade700;
      case 4: return Colors.lightGreen;
      case 5: return Colors.green;
      default: return Colors.grey;
    }
  }

  String _getMoodEmoji(int mood) {
    switch (mood) {
      case 1: return '😢';
      case 2: return '😞';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😄';
      default: return '—';
    }
  }

  // =====================
  // Journal Tab
  // =====================

  Widget _buildJournalTab(bool isDark) {
    final entries = _journeyService.entries;
    
    if (entries.isEmpty) {
      return Container(
        color: AppTheme.getBackgroundColor(context),
        child: Padding(
        padding: const EdgeInsets.only(top: 16),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
            Icon(
              Icons.edit_note,
              size: 64,
              color: isDark ? Colors.white24 : Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No journal entries yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Start tracking your daily progress',
              style: TextStyle(
                color: isDark ? Colors.white60 : Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddEntryScreen()),
                );
              },
              icon: const Icon(Icons.add),
              label: const Text('Add First Entry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD81B60),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
        ),
        ),
      );
    }
    
    return Container(
      color: AppTheme.getBackgroundColor(context),
      child: ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      itemCount: entries.length + 1,
      itemBuilder: (context, index) {
        if (index == entries.length) {
          return const SizedBox(height: 16);
        }
        final entry = entries[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildJournalEntryCard(entry, isDark),
        );
      },
      ),
    );
  }

  Widget _buildJournalEntryCard(JourneyEntry entry, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(entry.moodEmoji, style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry.formattedDate,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    Text(
                      'Mood: ${entry.moodLabel}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white60 : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              if (entry.hasAppointment)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.event, size: 14, color: Colors.blue),
                      SizedBox(width: 4),
                      Text(
                        'Appt',
                        style: TextStyle(fontSize: 10, color: Colors.blue),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildMiniStat('Pain', '${entry.painLevel}/10', Colors.red),
              const SizedBox(width: 16),
              _buildMiniStat('Energy', '${entry.energyLevel}/10', Colors.green),
              const SizedBox(width: 16),
              _buildMiniStat('Sleep', '${entry.sleepQuality}/5', Colors.purple),
            ],
          ),
          if (entry.symptoms.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: entry.symptoms.map((s) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  s,
                  style: const TextStyle(fontSize: 10, color: Colors.orange),
                ),
              )).toList(),
            ),
          ],
          if (entry.notes != null && entry.notes!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              entry.notes!,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white70 : Colors.grey.shade700,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMiniStat(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: AppTheme.isDarkMode(context) ? Colors.white60 : Colors.grey,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  // =====================
  // Treatment Tab
  // =====================

  Widget _buildTreatmentTab(bool isDark) {
    final treatments = _journeyService.treatments;
    
    if (treatments.isEmpty) {
      return Container(
        color: AppTheme.getBackgroundColor(context),
        child: Padding(
          padding: const EdgeInsets.only(top: 16),
          child: Center(
            child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
            Icon(
              Icons.medical_services,
              size: 64,
              color: isDark ? Colors.white24 : Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No treatments added',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Track your treatment progress here',
              style: TextStyle(
                color: isDark ? Colors.white60 : Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddTreatmentScreen()),
                );
              },
              icon: const Icon(Icons.add),
              label: const Text('Add Treatment'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD81B60),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
          ),
        ),
      );
    }

    return Container(
      color: AppTheme.getBackgroundColor(context),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        itemCount: treatments.length + 1,
      itemBuilder: (context, index) {
        if (index == treatments.length) {
          return const SizedBox(height: 16);
        }
        final treatment = treatments[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildTreatmentProgressCard(treatment, isDark),
        );
      },
      ),
    );
  }

  Widget _buildTreatmentProgressCard(Treatment treatment, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFD81B60).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.medical_services,
                  color: Color(0xFFD81B60),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      treatment.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    Text(
                      treatment.typeDisplayName,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white60 : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              if (treatment.isActive)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Active',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          if (treatment.totalSessions > 0) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Progress: ${treatment.completedSessions}/${treatment.totalSessions} sessions',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.white60 : Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: treatment.progressPercentage / 100,
                          backgroundColor: isDark ? Colors.white10 : Colors.grey.shade200,
                          valueColor: const AlwaysStoppedAnimation(Color(0xFFD81B60)),
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  '${treatment.progressPercentage.toInt()}%',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD81B60),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (treatment.completedSessions < treatment.totalSessions)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _journeyService.incrementSession(treatment.id),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Complete Session'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFD81B60),
                    side: const BorderSide(color: Color(0xFFD81B60)),
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }

  // =====================
  // Milestones Tab
  // =====================

  Widget _buildMilestonesTab(bool isDark) {
    final milestones = _journeyService.milestones;
    
    if (milestones.isEmpty) {
      return Container(
        color: AppTheme.getBackgroundColor(context),
        child: Padding(
          padding: const EdgeInsets.only(top: 16),
          child: Center(
            child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
            Icon(
              Icons.emoji_events,
              size: 64,
              color: isDark ? Colors.white24 : Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No milestones yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.getTextColor(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Keep tracking to unlock achievements!',
              style: TextStyle(
                color: isDark ? Colors.white60 : Colors.grey.shade600,
              ),
            ),
          ],
        ),
          ),
        ),
      );
    }

    return Container(
      color: AppTheme.getBackgroundColor(context),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        itemCount: milestones.length + 1,
      itemBuilder: (context, index) {
        if (index == milestones.length) {
          return const SizedBox(height: 16);
        }
        final milestone = milestones[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildMilestoneCard(milestone, isDark),
        );
      },
      ),
    );
  }

  Widget _buildMilestoneCard(Milestone milestone, bool isDark, {bool compact = false}) {
    return Container(
      padding: EdgeInsets.all(compact ? 12 : 16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: milestone.isCelebrated ? null : Border.all(
          color: Colors.amber.withValues(alpha: 0.5),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(compact ? 8 : 12),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.emoji_events,
              color: Colors.amber.shade700,
              size: compact ? 20 : 28,
            ),
          ),
          SizedBox(width: compact ? 10 : 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  milestone.title,
                  style: TextStyle(
                    fontSize: compact ? 14 : 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.getTextColor(context),
                  ),
                ),
                if (!compact) ...[
                  const SizedBox(height: 4),
                  Text(
                    milestone.description,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.grey.shade600,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  milestone.formattedDate,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? Colors.white38 : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          if (!milestone.isCelebrated && !compact)
            IconButton(
              icon: const Icon(Icons.celebration, color: Colors.amber),
              onPressed: () {
                _journeyService.celebrateMilestone(milestone.id);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('🎉 Celebrated!')),
                );
              },
            ),
        ],
      ),
    );
  }
}
