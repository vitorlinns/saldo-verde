import 'package:flutter/material.dart';
import '../../../core/utils/colors.dart';

class ButtonSubmit extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final double height;
  final double borderRadius;
  final double fontSize;

  const ButtonSubmit({
    super.key,
    required this.label,
    this.onPressed,
    this.height = 52,
    this.borderRadius = 14,
    this.fontSize = 16,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: height,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primaryButton,
          foregroundColor: AppColors.black,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          textStyle: TextStyle(
            fontFamily: 'Funnel Display',
            fontSize: fontSize,
            fontWeight: FontWeight.w700,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20),
        ),
        child: Center(
          child: Text(label),
        ),
      ),
    );
  }
}
