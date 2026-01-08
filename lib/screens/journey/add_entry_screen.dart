import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cancerapp/models/journey_entry.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/providers/providers.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';

class AddEntryScreen extends ConsumerStatefulWidget {
  final JourneyEntry? existingEntry;
  
  const AddEntryScreen({super.key, this.existingEntry});

  @override
  ConsumerState<AddEntryScreen> createState() => _AddEntryScreenState();
}

class _AddEntryScreenState extends ConsumerState<AddEntryScreen> {
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _appointmentNotesController = TextEditingController();
  
  int _moodLevel = 3;
  int _painLevel = 0;
  int _energyLevel = 5;
  int _sleepQuality = 3;
  bool _hasAppointment = false;
  List<String> _selectedSymptoms = [];
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.existingEntry != null) {
      final entry = widget.existingEntry!;
      _moodLevel = entry.moodLevel;
      _painLevel = entry.painLevel;
      _energyLevel = entry.energyLevel;
      _sleepQuality = entry.sleepQuality;
      _hasAppointment = entry.hasAppointment;
      _selectedSymptoms = List.from(entry.symptoms);
      _notesController.text = entry.notes ?? '';
      _appointmentNotesController.text = entry.appointmentNotes ?? '';
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    _appointmentNotesController.dispose();
    super.dispose();
  }

  Future<void> _saveEntry() async {
    setState(() {
      _isSaving = true;
    });

    try {
      final entry = JourneyEntry(
        id: widget.existingEntry?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        date: widget.existingEntry?.date ?? DateTime.now(),
        moodLevel: _moodLevel,
        painLevel: _painLevel,
        energyLevel: _energyLevel,
        sleepQuality: _sleepQuality,
        symptoms: _selectedSymptoms,
        notes: _notesController.text.isEmpty ? null : _notesController.text,
        hasAppointment: _hasAppointment,
        appointmentNotes: _appointmentNotesController.text.isEmpty 
            ? null 
            : _appointmentNotesController.text,
      );

      if (widget.existingEntry != null) {
        await ref.read(journeyEntriesProvider.notifier).updateEntry(entry);
      } else {
        await ref.read(journeyEntriesProvider.notifier).addEntry(entry);
      }

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.existingEntry != null 
                ? 'Entry updated!' 
                : 'Entry added! Keep up the great work! 💪'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving entry: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppTheme.isDarkMode(context);
    
    return Scaffold(
      backgroundColor: AppTheme.getBackgroundColor(context),
      body: CustomScrollView(
        slivers: [
          CustomAppHeader(
            title: widget.existingEntry != null ? 'Edit Entry' : 'Daily Check-in',
            subtitle: widget.existingEntry != null ? 'Update your health status' : 'Track your daily wellness',
            showBackButton: true,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Mood Section
                  _buildSection(
                    isDark,
                    title: 'How are you feeling today?',
                    icon: Icons.sentiment_satisfied_alt,
                    child: _buildMoodSelector(isDark),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Pain Level Section
                  _buildSection(
                    isDark,
                    title: 'Pain Level',
                    icon: Icons.healing,
                    child: _buildSlider(
                      isDark,
                      value: _painLevel,
                      max: 10,
                      color: _getPainColor(_painLevel),
                      label: _painLevel == 0 
                          ? 'No pain' 
                          : '$_painLevel/10 ${_getPainLabel(_painLevel)}',
                      onChanged: (value) => setState(() => _painLevel = value.round()),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
            
            // Energy Level Section
            _buildSection(
              isDark,
              title: 'Energy Level',
              icon: Icons.battery_charging_full,
              child: _buildSlider(
                isDark,
                value: _energyLevel,
                max: 10,
                color: _getEnergyColor(_energyLevel),
                label: '$_energyLevel/10 ${_getEnergyLabel(_energyLevel)}',
                onChanged: (value) => setState(() => _energyLevel = value.round()),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Sleep Quality Section
            _buildSection(
              isDark,
              title: 'Sleep Quality Last Night',
              icon: Icons.bedtime,
              child: _buildSleepSelector(isDark),
            ),
            
            const SizedBox(height: 24),
            
            // Symptoms Section
            _buildSection(
              isDark,
              title: 'Any symptoms today?',
              icon: Icons.medical_information,
              child: _buildSymptomsSelector(isDark),
            ),
            
            const SizedBox(height: 24),
            
            // Appointment Toggle
            _buildSection(
              isDark,
              title: 'Doctor\'s Appointment',
              icon: Icons.event,
              child: _buildAppointmentToggle(isDark),
            ),
            
            const SizedBox(height: 24),
            
            // Notes Section
            _buildSection(
              isDark,
              title: 'Additional Notes',
              icon: Icons.notes,
              child: _buildNotesField(isDark),
            ),
            
            const SizedBox(height: 32),
            
                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveEntry,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD81B60),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation(Colors.white),
                              ),
                            )
                          : Text(
                              widget.existingEntry != null ? 'Update Entry' : 'Save Entry',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(
    bool isDark, {
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: const Color(0xFFD81B60), size: 20),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.getTextColor(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }

  Widget _buildMoodSelector(bool isDark) {
    final moods = [
      {'emoji': '😢', 'label': 'Awful', 'value': 1},
      {'emoji': '😞', 'label': 'Bad', 'value': 2},
      {'emoji': '😐', 'label': 'Okay', 'value': 3},
      {'emoji': '🙂', 'label': 'Good', 'value': 4},
      {'emoji': '😄', 'label': 'Great', 'value': 5},
    ];
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: moods.map((mood) {
          final isSelected = _moodLevel == mood['value'];
          return InkWell(
            onTap: () => setState(() => _moodLevel = mood['value'] as int),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected 
                    ? const Color(0xFFD81B60).withValues(alpha: 0.2) 
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: isSelected 
                    ? Border.all(color: const Color(0xFFD81B60), width: 2) 
                    : null,
              ),
              child: Column(
                children: [
                  Text(
                    mood['emoji'] as String,
                    style: const TextStyle(fontSize: 32),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    mood['label'] as String,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected 
                          ? const Color(0xFFD81B60) 
                          : (isDark ? Colors.white60 : Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSlider(
    bool isDark, {
    required int value,
    required int max,
    required Color color,
    required String label,
    required ValueChanged<double> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '0',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.white60 : Colors.grey,
                ),
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                '$max',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.white60 : Colors.grey,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: color,
              inactiveTrackColor: color.withValues(alpha: 0.2),
              thumbColor: color,
              overlayColor: color.withValues(alpha: 0.2),
            ),
            child: Slider(
              value: value.toDouble(),
              min: 0,
              max: max.toDouble(),
              divisions: max,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSleepSelector(bool isDark) {
    final sleepOptions = [
      {'emoji': '😫', 'label': 'Terrible', 'value': 1},
      {'emoji': '😴', 'label': 'Poor', 'value': 2},
      {'emoji': '😑', 'label': 'Fair', 'value': 3},
      {'emoji': '😊', 'label': 'Good', 'value': 4},
      {'emoji': '🌟', 'label': 'Excellent', 'value': 5},
    ];
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: sleepOptions.map((option) {
          final isSelected = _sleepQuality == option['value'];
          return InkWell(
            onTap: () => setState(() => _sleepQuality = option['value'] as int),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected 
                    ? Colors.purple.withValues(alpha: 0.2) 
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: isSelected 
                    ? Border.all(color: Colors.purple, width: 2) 
                    : null,
              ),
              child: Column(
                children: [
                  Text(option['emoji'] as String, style: const TextStyle(fontSize: 24)),
                  const SizedBox(height: 2),
                  Text(
                    option['label'] as String,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected 
                          ? Colors.purple 
                          : (isDark ? Colors.white60 : Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSymptomsSelector(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: SymptomOptions.commonSymptoms.map((symptom) {
          final isSelected = _selectedSymptoms.contains(symptom);
          return FilterChip(
            label: Text(symptom),
            selected: isSelected,
            onSelected: (selected) {
              setState(() {
                if (selected) {
                  _selectedSymptoms.add(symptom);
                } else {
                  _selectedSymptoms.remove(symptom);
                }
              });
            },
            selectedColor: Colors.orange.withValues(alpha: 0.3),
            checkmarkColor: Colors.orange,
            labelStyle: TextStyle(
              fontSize: 12,
              color: isSelected 
                  ? Colors.orange.shade800 
                  : (isDark ? Colors.white70 : Colors.grey.shade700),
            ),
            backgroundColor: isDark ? Colors.white10 : Colors.grey.shade100,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildAppointmentToggle(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Had a doctor\'s appointment today?',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.getTextColor(context),
                      ),
                    ),
                    Text(
                      'Add notes from your visit',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white60 : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: _hasAppointment,
                onChanged: (value) => setState(() => _hasAppointment = value),
                activeColor: const Color(0xFFD81B60),
              ),
            ],
          ),
          if (_hasAppointment) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _appointmentNotesController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'What did the doctor say? Any new findings or instructions?',
                hintStyle: TextStyle(
                  color: isDark ? Colors.white38 : Colors.grey.shade400,
                  fontSize: 13,
                ),
                filled: true,
                fillColor: isDark ? Colors.white10 : Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              style: TextStyle(
                color: AppTheme.getTextColor(context),
                fontSize: 14,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNotesField(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: _notesController,
        maxLines: 4,
        decoration: InputDecoration(
          hintText: 'How was your day? Any thoughts or feelings you want to record?',
          hintStyle: TextStyle(
            color: isDark ? Colors.white38 : Colors.grey.shade400,
            fontSize: 13,
          ),
          contentPadding: const EdgeInsets.all(16),
          filled: true,
          fillColor: isDark ? AppTheme.darkCard : Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
        ),
        style: TextStyle(
          color: AppTheme.getTextColor(context),
          fontSize: 14,
        ),
      ),
    );
  }

  Color _getPainColor(int level) {
    if (level <= 2) return Colors.green;
    if (level <= 4) return Colors.yellow.shade700;
    if (level <= 6) return Colors.orange;
    return Colors.red;
  }

  String _getPainLabel(int level) {
    if (level <= 2) return '(Mild)';
    if (level <= 4) return '(Moderate)';
    if (level <= 6) return '(Significant)';
    if (level <= 8) return '(Severe)';
    return '(Extreme)';
  }

  Color _getEnergyColor(int level) {
    if (level <= 2) return Colors.red;
    if (level <= 4) return Colors.orange;
    if (level <= 6) return Colors.yellow.shade700;
    if (level <= 8) return Colors.lightGreen;
    return Colors.green;
  }

  String _getEnergyLabel(int level) {
    if (level <= 2) return '(Exhausted)';
    if (level <= 4) return '(Tired)';
    if (level <= 6) return '(Moderate)';
    if (level <= 8) return '(Energized)';
    return '(Full Energy)';
  }
}
