import 'package:flutter/material.dart';
import '../../../core/utils/colors.dart';

enum SnackType { success, error }

void showAppSnackBar(
  BuildContext context,
  String message, {
  SnackType type = SnackType.success,
  Duration duration = const Duration(seconds: 4),
}) {
  final overlay = Overlay.of(context);

  late OverlayEntry entry;
  entry = OverlayEntry(
    builder: (_) => _AppSnackBarOverlay(
      message: message,
      type: type,
      duration: duration,
      onDismissed: entry.remove,
    ),
  );

  overlay.insert(entry);
}

class _AppSnackBarOverlay extends StatefulWidget {
  final String message;
  final SnackType type;
  final Duration duration;
  final VoidCallback onDismissed;

  const _AppSnackBarOverlay({
    required this.message,
    required this.type,
    required this.duration,
    required this.onDismissed,
  });

  @override
  State<_AppSnackBarOverlay> createState() => _AppSnackBarOverlayState();
}

class _AppSnackBarOverlayState extends State<_AppSnackBarOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
      reverseDuration: const Duration(milliseconds: 250),
    );

    _animation = Tween<Offset>(
      begin: const Offset(0, -1.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    _controller.forward();
    Future.delayed(widget.duration, _dismiss);
  }

  void _dismiss() {
    if (mounted) {
      _controller.reverse().then((_) {
        widget.onDismissed();
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color get _backgroundColor {
    switch (widget.type) {
      case SnackType.error:
        return AppColors.danger;
      case SnackType.success:
        return AppColors.primary;
    }
  }

  IconData get _iconData {
    switch (widget.type) {
      case SnackType.error:
        return Icons.error_outline;
      case SnackType.success:
        return Icons.check_circle_outline;
    }
  }

  Color get _iconColor {
    return AppColors.black;
  }

  Color get _textColor {
    return AppColors.black;
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: SafeArea(
        top: true,
        bottom: false,
        child: SlideTransition(
          position: _animation,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
            child: Material(
              color: Colors.transparent,
              child: Container(
                decoration: BoxDecoration(
                  color: _backgroundColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                child: Row(
                  children: [
                    Icon(_iconData, color: _iconColor),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        widget.message,
                        style: TextStyle(
                          color: _textColor,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
