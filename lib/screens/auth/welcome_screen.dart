import 'package:flutter/material.dart';
import 'package:cancerapp/utils/theme.dart';
import 'package:cancerapp/utils/constants.dart';
import 'package:cancerapp/utils/routes.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.white,
              Color(0xFFFFF0F5),
              Color(0xFFFCE4EC),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Pink dripping effect at top
              Stack(
                children: [
                  CustomPaint(
                    size: Size(MediaQuery.of(context).size.width, 80),
                    painter: DrippingPaintPainter(),
                  ),
                ],
              ),
              
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Spacer(),
                      
                      // Logo
                      Image.asset(
                        'assets/images/oncosense_logoo.png',
                        width: 100,
                        height: 100,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryPink.withOpacity(0.2),
                                  blurRadius: 15,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.favorite,
                              size: 50,
                              color: Color(0xFFE91E63),
                            ),
                          );
                        },
                      ),
                      
                      const SizedBox(height: 24.0),
                      
                      // App Name
                      Text(
                        AppConstants.appName,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFD81B60),
                          letterSpacing: 0.5,
                        ),
                      ),
                      
                      const SizedBox(height: 12.0),
                      
                      // Tagline
                      Text(
                        AppConstants.appTagline,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                          height: 1.4,
                        ),
                      ),
                      
                      const Spacer(),
                      
                      // Create an account button (filled)
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pushNamed(context, AppRoutes.register);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFFD81B60),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(28),
                            ),
                            elevation: 0,
                          ),
                          child: const Text(
                            'Create an account',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16.0),
                      
                      // I already have an account button (outlined)
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.pushNamed(context, AppRoutes.login);
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Color(0xFFD81B60),
                            side: BorderSide(
                              color: Color(0xFFD81B60),
                              width: 2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(28),
                            ),
                          ),
                          child: const Text(
                            'I already have an account',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 40.0),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Custom painter for dripping effect
class DrippingPaintPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Color(0xFFF8BBD0)
      ..style = PaintingStyle.fill;

    final path = Path();
    
    // Start from top left
    path.moveTo(0, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, 40);
    
    // Create dripping effect with curves
    double dripWidth = size.width / 6;
    
    for (int i = 6; i >= 0; i--) {
      double x = i * dripWidth;
      double dripHeight = (i % 2 == 0) ? 60 : 45;
      
      if (i == 6) {
        path.lineTo(x + dripWidth, 40);
      }
      
      path.quadraticBezierTo(
        x + dripWidth * 0.75,
        40,
        x + dripWidth * 0.5,
        dripHeight,
      );
      path.quadraticBezierTo(
        x + dripWidth * 0.25,
        40,
        x,
        40,
      );
    }
    
    path.lineTo(0, 40);
    path.close();

    canvas.drawPath(path, paint);
    
    // Add sprinkles on top
    final sprinklePaint = Paint()
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    
    final random = [
      {'x': 30.0, 'y': 15.0, 'color': Color(0xFFFF4081)},
      {'x': 80.0, 'y': 25.0, 'color': Color(0xFFE91E63)},
      {'x': 130.0, 'y': 10.0, 'color': Color(0xFFFF80AB)},
      {'x': 180.0, 'y': 20.0, 'color': Color(0xFFF06292)},
      {'x': 230.0, 'y': 12.0, 'color': Color(0xFFFF4081)},
      {'x': 280.0, 'y': 18.0, 'color': Color(0xFFE91E63)},
      {'x': 330.0, 'y': 22.0, 'color': Color(0xFFFF80AB)},
    ];
    
    for (var sprinkle in random) {
      sprinklePaint.color = sprinkle['color'] as Color;
      canvas.drawLine(
        Offset(sprinkle['x'] as double, sprinkle['y'] as double),
        Offset((sprinkle['x'] as double) + 8, (sprinkle['y'] as double) + 3),
        sprinklePaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}