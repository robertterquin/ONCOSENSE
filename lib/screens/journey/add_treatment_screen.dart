import 'package:flutter/material.dart';
import 'package:cancerapp/services/journey_service.dart';
import 'package:cancerapp/models/treatment.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/widgets/custom_app_header.dart';

class AddTreatmentScreen extends StatefulWidget {
  const AddTreatmentScreen({super.key});

  @override
  State<AddTreatmentScreen> createState() => _AddTreatmentScreenState();
}

class _AddTreatmentScreenState extends State<AddTreatmentScreen> {
  final JourneyService _journeyService = JourneyService();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  
  TreatmentType _selectedType = TreatmentType.chemotherapy;
  int _totalSessions = 0;
  DateTime _startDate = DateTime.now();
  List<String> _selectedSideEffects = [];
  bool _isSaving = false;

  final List<String> _commonSideEffects = [
    'Fatigue',
    'Nausea',
    'Hair Loss',
    'Appetite Changes',
    'Pain',
    'Numbness',
    'Skin Changes',
    'Memory Issues',
    'Mouth Sores',
    'Weight Changes',
    'Insomnia',
    'Anxiety',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _saveTreatment() async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a treatment name'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    try {
      final treatment = Treatment(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: _nameController.text,
        type: _selectedType,
        startDate: _startDate,
        totalSessions: _totalSessions,
        completedSessions: 0,
        sideEffects: _selectedSideEffects,
        notes: _notesController.text.isEmpty ? null : _notesController.text,
        isActive: true,
      );

      await _journeyService.addTreatment(treatment);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Treatment added! You\'ve got this! 💪'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving treatment: $e'),
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
          const CustomAppHeader(
            title: 'Add Treatment',
            subtitle: 'Track your treatment journey',
            showBackButton: true,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Treatment Type Section
                  _buildSection(
                    isDark,
                    title: 'Treatment Type',
                    icon: Icons.medical_services,
                    child: _buildTreatmentTypeSelector(isDark),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Treatment Name Section
                  _buildSection(
                    isDark,
                    title: 'Treatment Name',
                    icon: Icons.label,
                    child: _buildNameField(isDark),
                  ),
                  
                  const SizedBox(height: 24),
            
            // Start Date Section
            _buildSection(
              isDark,
              title: 'Start Date',
              icon: Icons.calendar_today,
              child: _buildDatePicker(isDark),
            ),
            
            const SizedBox(height: 24),
            
            // Sessions Section (for applicable treatment types)
            if (_selectedType != TreatmentType.surgery && 
                _selectedType != TreatmentType.other)
              Column(
                children: [
                  _buildSection(
                    isDark,
                    title: 'Total Sessions',
                    icon: Icons.repeat,
                    child: _buildSessionsCounter(isDark),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            
            // Side Effects Section
            _buildSection(
              isDark,
              title: 'Expected/Experienced Side Effects',
              icon: Icons.warning_amber,
              child: _buildSideEffectsSelector(isDark),
            ),
            
            const SizedBox(height: 24),
            
            // Notes Section
            _buildSection(
              isDark,
              title: 'Notes',
              icon: Icons.notes,
              child: _buildNotesField(isDark),
            ),
            
            const SizedBox(height: 32),
            
                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveTreatment,
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
                          : const Text(
                              'Add Treatment',
                              style: TextStyle(
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

  Widget _buildTreatmentTypeSelector(bool isDark) {
    final treatmentTypes = [
      {'type': TreatmentType.chemotherapy, 'icon': Icons.science, 'color': Colors.purple},
      {'type': TreatmentType.radiation, 'icon': Icons.bolt, 'color': Colors.orange},
      {'type': TreatmentType.surgery, 'icon': Icons.medical_services, 'color': Colors.red},
      {'type': TreatmentType.immunotherapy, 'icon': Icons.shield, 'color': Colors.blue},
      {'type': TreatmentType.hormoneTherapy, 'icon': Icons.medication, 'color': Colors.teal},
      {'type': TreatmentType.targetedTherapy, 'icon': Icons.gps_fixed, 'color': Colors.indigo},
      {'type': TreatmentType.stemCell, 'icon': Icons.biotech, 'color': Colors.cyan},
      {'type': TreatmentType.other, 'icon': Icons.more_horiz, 'color': Colors.grey},
    ];
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children: treatmentTypes.map((item) {
          final type = item['type'] as TreatmentType;
          final icon = item['icon'] as IconData;
          final color = item['color'] as Color;
          final isSelected = _selectedType == type;
          
          return InkWell(
            onTap: () => setState(() => _selectedType = type),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected 
                    ? color.withValues(alpha: 0.2) 
                    : (isDark ? Colors.white10 : Colors.grey.shade100),
                borderRadius: BorderRadius.circular(12),
                border: isSelected ? Border.all(color: color, width: 2) : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    icon,
                    color: isSelected ? color : (isDark ? Colors.white60 : Colors.grey),
                    size: 18,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _getTypeDisplayName(type),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected 
                          ? color 
                          : (isDark ? Colors.white70 : Colors.grey.shade700),
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

  String _getTypeDisplayName(TreatmentType type) {
    switch (type) {
      case TreatmentType.chemotherapy:
        return 'Chemotherapy';
      case TreatmentType.radiation:
        return 'Radiation';
      case TreatmentType.surgery:
        return 'Surgery';
      case TreatmentType.immunotherapy:
        return 'Immunotherapy';
      case TreatmentType.hormoneTherapy:
        return 'Hormone';
      case TreatmentType.targetedTherapy:
        return 'Targeted';
      case TreatmentType.stemCell:
        return 'Stem Cell';
      case TreatmentType.other:
        return 'Other';
    }
  }

  Widget _buildNameField(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: _nameController,
        decoration: InputDecoration(
          hintText: 'e.g., FOLFOX Regimen, Mastectomy, etc.',
          hintStyle: TextStyle(
            color: isDark ? Colors.white38 : Colors.grey.shade400,
            fontSize: 14,
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
          fontSize: 15,
        ),
      ),
    );
  }

  Widget _buildDatePicker(bool isDark) {
    return InkWell(
      onTap: () => _selectDate(context),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFD81B60).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.event,
                color: Color(0xFFD81B60),
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _formatDate(_startDate),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.getTextColor(context),
                    ),
                  ),
                  Text(
                    'Tap to change',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.edit_calendar,
              color: isDark ? Colors.white38 : Colors.grey,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSessionsCounter(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text(
            'How many sessions are planned?',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? Colors.white60 : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                onPressed: _totalSessions > 0 
                    ? () => setState(() => _totalSessions--) 
                    : null,
                icon: const Icon(Icons.remove_circle_outline),
                color: const Color(0xFFD81B60),
                iconSize: 32,
              ),
              Container(
                width: 80,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFD81B60).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _totalSessions == 0 ? 'N/A' : '$_totalSessions',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.getTextColor(context),
                  ),
                ),
              ),
              IconButton(
                onPressed: () => setState(() => _totalSessions++),
                icon: const Icon(Icons.add_circle_outline),
                color: const Color(0xFFD81B60),
                iconSize: 32,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _totalSessions == 0 
                ? 'Set to 0 if unknown or not applicable' 
                : 'You can update this later',
            style: TextStyle(
              fontSize: 11,
              color: isDark ? Colors.white38 : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSideEffectsSelector(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select all that apply (optional)',
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.white60 : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _commonSideEffects.map((effect) {
              final isSelected = _selectedSideEffects.contains(effect);
              return FilterChip(
                label: Text(effect),
                selected: isSelected,
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedSideEffects.add(effect);
                    } else {
                      _selectedSideEffects.remove(effect);
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
        maxLines: 3,
        decoration: InputDecoration(
          hintText: 'Any additional details about this treatment...',
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

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFFD81B60),
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black87,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null) {
      setState(() {
        _startDate = picked;
      });
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
