import 'dart:async';

import 'package:flutter/material.dart';
import '../../../core/utils/colors.dart';
import '../../widgets/btn/button_submit.dart';
import '../../widgets/snackbar/snack.dart';
import 'new_password.dart';

class CodePage extends StatefulWidget {
  final String email;

  const CodePage({super.key, required this.email});

  @override
  State<CodePage> createState() => _CodePageState();
}

class _CodePageState extends State<CodePage> {
  final _codeControllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());
  Timer? _resendTimer;
  int _secondsRemaining = 30;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  void _startResendTimer() {
    _resendTimer?.cancel();
    setState(() {
      _secondsRemaining = 30;
      _canResend = false;
    });

    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        setState(() {
          _secondsRemaining = 0;
          _canResend = true;
        });
        return;
      }
      setState(() {
        _secondsRemaining -= 1;
      });
    });
  }

  void _resendCode() {
    for (final controller in _codeControllers) {
      controller.clear();
    }
    _focusNodes.first.requestFocus();
    showAppSnackBar(
      context,
      'Código reenviado para ${widget.email}.',
      type: SnackType.success,
    );
    _startResendTimer();
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    for (final controller in _codeControllers) {
      controller.dispose();
    }
    for (final focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  void _verifyCode() {
    final code = _codeControllers.map((controller) => controller.text).join();
    if (code.length != 6 || code.contains(RegExp(r'[^0-9]'))) {
      showAppSnackBar(
        context,
        'Informe o código de 6 dígitos enviado por e-mail.',
        type: SnackType.error,
      );
      return;
    }

    showAppSnackBar(
      context,
      'Código verificado! Você pode criar uma nova senha.',
      type: SnackType.success,
    );

    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (_, animation, secondaryAnimation) =>
            const NewPasswordPage(),
        transitionDuration: const Duration(milliseconds: 300),
        transitionsBuilder: (_, animation, secondaryAnimation, child) {
          final tween = Tween<Offset>(
            begin: const Offset(1.0, 0.0),
            end: Offset.zero,
          ).chain(CurveTween(curve: Curves.easeInOut));
          return SlideTransition(
            position: animation.drive(tween),
            child: child,
          );
        },
      ),
    );
  }

  Widget _buildCodeBox(int index) {
    return SizedBox(
      width: 48,
      child: TextField(
        controller: _codeControllers[index],
        focusNode: _focusNodes[index],
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        cursorColor: AppColors.white,
        maxLength: 1,
        style: const TextStyle(
          color: AppColors.white,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        decoration: InputDecoration(
          filled: true,
          fillColor: const Color.fromARGB(103, 26, 26, 26),
          counterText: '',
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: AppColors.surfaceVariant),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: AppColors.surfaceVariant),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: AppColors.primary),
          ),
        ),
        onChanged: (value) {
          if (value.isNotEmpty && index < _focusNodes.length - 1) {
            _focusNodes[index + 1].requestFocus();
          }
          if (value.isEmpty && index > 0) {
            _focusNodes[index - 1].requestFocus();
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: EdgeInsets.zero,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 24,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () => Navigator.of(context).pop(),
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.arrow_back,
                                color: AppColors.white,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Código de verificação',
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Digite os 6 dígitos enviados para ${widget.email}.',
                        style: TextStyle(
                          color: AppColors.neutralText,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
                Padding(
                  padding: EdgeInsets.zero,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(
                            6,
                            (index) => _buildCodeBox(index),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _canResend
                            ? TextButton(
                                onPressed: _resendCode,
                                child: const Text(
                                  'Reenviar código',
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              )
                            : Text(
                                'Reenviar em $_secondsRemaining s',
                                style: const TextStyle(
                                  color: AppColors.neutralText,
                                  fontSize: 14,
                                ),
                              ),
                        const SizedBox(height: 16),
                        ButtonSubmit(
                          label: 'Confirmar código',
                          onPressed: _verifyCode,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
