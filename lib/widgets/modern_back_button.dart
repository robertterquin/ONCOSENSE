import 'package:flutter/material.dart';

/// A modern, minimal back button widget with a translucent background
/// and rounded corners. Designed for use in app bars and headers.
class ModernBackButton extends StatelessWidget {
  /// The callback function when the button is pressed.
  /// If null, defaults to Navigator.pop(context).
  final VoidCallback? onPressed;
  
  /// The color of the back arrow icon.
  /// Defaults to Colors.white for use on colored backgrounds.
  final Color iconColor;
  
  /// The background color of the button.
  /// Defaults to a translucent white.
  final Color? backgroundColor;
  
  /// The size of the icon.
  /// Defaults to 20.
  final double iconSize;

  const ModernBackButton({
    super.key,
    this.onPressed,
    this.iconColor = Colors.white,
    this.backgroundColor,
    this.iconSize = 20,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed ?? () => Navigator.pop(context),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Icon(
              Icons.arrow_back_ios_new_rounded,
              color: iconColor,
              size: iconSize,
            ),
          ),
        ),
      ),
    );
  }
}

/// A variant of the modern back button for light backgrounds
class ModernBackButtonLight extends StatelessWidget {
  /// The callback function when the button is pressed.
  /// If null, defaults to Navigator.pop(context).
  final VoidCallback? onPressed;

  const ModernBackButtonLight({
    super.key,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ModernBackButton(
      onPressed: onPressed,
      iconColor: const Color(0xFF424242),
      backgroundColor: const Color(0xFFF5F5F5),
    );
  }
}

/// A modern, minimal close button widget with a translucent background
/// and rounded corners. Designed for use in modal/form screens.
class ModernCloseButton extends StatelessWidget {
  /// The callback function when the button is pressed.
  /// If null, defaults to Navigator.pop(context).
  final VoidCallback? onPressed;
  
  /// The color of the close icon.
  /// Defaults to dark gray for light backgrounds.
  final Color iconColor;
  
  /// The background color of the button.
  /// Defaults to a light gray.
  final Color? backgroundColor;

  const ModernCloseButton({
    super.key,
    this.onPressed,
    this.iconColor = const Color(0xFF424242),
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: backgroundColor ?? const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed ?? () => Navigator.pop(context),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Icon(
              Icons.close_rounded,
              color: iconColor,
              size: 20,
            ),
          ),
        ),
      ),
    );
  }
}
