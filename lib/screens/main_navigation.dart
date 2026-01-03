import 'package:flutter/material.dart';
import 'package:cancerapp/screens/home/home_screen.dart';
import 'package:cancerapp/screens/cancer_info/cancer_info_screen.dart';
import 'package:cancerapp/screens/prevention/prevention_screen.dart';
import 'package:cancerapp/screens/forum/forum_screen.dart';
import 'package:cancerapp/screens/resources/resources_screen.dart';
import 'package:cancerapp/screens/journey/journey_screen.dart';
import 'package:cancerapp/utils/theme.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  // Lazy-loaded screen instances
  final Map<int, Widget> _screenCache = {};

  // Track which screens have been created
  final Set<int> _loadedScreens = {0}; // Home loads immediately

  Widget _getScreen(int index) {
    if (!_screenCache.containsKey(index)) {
      switch (index) {
        case 0:
          _screenCache[index] = const HomeScreen();
          break;
        case 1:
          _screenCache[index] = const CancerInfoScreen();
          break;
        case 2:
          _screenCache[index] = const PreventionScreen();
          break;
        case 3:
          _screenCache[index] = const ForumScreen();
          break;
        case 4:
          _screenCache[index] = const ResourcesScreen();
          break;
        case 5:
          _screenCache[index] = const JourneyScreen();
          break;
        default:
          _screenCache[index] = const HomeScreen();
      }
    }
    return _screenCache[index]!;
  }

  void _onNavItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
      _loadedScreens.add(index); // Mark as loaded when navigated to
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppTheme.isDarkMode(context);
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: List.generate(
          6,
          (index) => _loadedScreens.contains(index) 
              ? _getScreen(index)
              : const SizedBox.shrink(), // Empty widget for unloaded screens
        ),
      ),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.3 : 0.15),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: _onNavItemTapped,
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.transparent,
            selectedItemColor: const Color(0xFFD81B60),
            unselectedItemColor: isDark ? AppTheme.darkTextSecondary : const Color(0xFF9E9E9E),
            elevation: 0,
            selectedFontSize: 10,
            unselectedFontSize: 9,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.medical_information_outlined),
                activeIcon: Icon(Icons.medical_information),
                label: 'Info',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.health_and_safety_outlined),
                activeIcon: Icon(Icons.health_and_safety),
                label: 'Prevention',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.forum_outlined),
                activeIcon: Icon(Icons.forum),
                label: 'Forum',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.support_agent_outlined),
                activeIcon: Icon(Icons.support_agent),
                label: 'Resources',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.auto_graph_outlined),
                activeIcon: Icon(Icons.auto_graph),
                label: 'Journey',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
