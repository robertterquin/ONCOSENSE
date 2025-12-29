import 'package:flutter/material.dart';
import 'package:cancerapp/services/health_reminders_service.dart';
import 'package:cancerapp/utils/theme.dart';

/// One-time setup screen to seed health reminders database
/// This only needs to be run once to populate the database
class SetupHealthRemindersScreen extends StatefulWidget {
  const SetupHealthRemindersScreen({super.key});

  @override
  State<SetupHealthRemindersScreen> createState() => _SetupHealthRemindersScreenState();
}

class _SetupHealthRemindersScreenState extends State<SetupHealthRemindersScreen> {
  final _healthRemindersService = HealthRemindersService();
  bool _isSeeding = false;
  bool _isComplete = false;
  String _message = '';

  Future<void> _seedReminders() async {
    setState(() {
      _isSeeding = true;
      _message = 'Setting up health reminders...';
    });

    try {
      await _healthRemindersService.seedHealthReminders();
      setState(() {
        _isSeeding = false;
        _isComplete = true;
        _message = '✅ Health reminders successfully set up!\n\nYou can now close this screen.';
      });
    } catch (e) {
      setState(() {
        _isSeeding = false;
        _message = '❌ Error: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.getSurfaceColor(context),
      appBar: AppBar(
        title: const Text('Setup Health Reminders'),
        backgroundColor: const Color(0xFFD81B60),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _isComplete ? Icons.check_circle : Icons.health_and_safety,
                size: 80,
                color: _isComplete ? Colors.green : const Color(0xFFD81B60),
              ),
              const SizedBox(height: 24),
              Text(
                'Health Reminders Database',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.getTextColor(context),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                _message.isEmpty
                    ? 'Click the button below to populate your database with reliable health reminders from trusted sources (WHO, CDC, American Cancer Society, etc.)'
                    : _message,
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.getSecondaryTextColor(context),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              if (!_isComplete)
                ElevatedButton(
                  onPressed: _isSeeding ? null : _seedReminders,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD81B60),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSeeding
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'Seed Reminders Database',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              if (_isComplete) ...[
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Done',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
