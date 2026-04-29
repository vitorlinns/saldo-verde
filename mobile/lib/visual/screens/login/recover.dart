import 'package:flutter/material.dart';
import '../../../core/utils/colors.dart';
import '../../widgets/btn/button_submit.dart';
import '../../widgets/inputs/input.dart';
import '../../widgets/snackbar/snack.dart';
import 'code.dart';

class RecoverPage extends StatefulWidget {
  const RecoverPage({super.key});

  @override
  State<RecoverPage> createState() => _RecoverPageState();
}

class _RecoverPageState extends State<RecoverPage> {
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) {
    final normalized = email.trim();
    return normalized.contains('@') && normalized.contains('.');
  }

  void _sendCode() {
    final email = _emailController.text.trim();
    if (email.isEmpty || !_isValidEmail(email)) {
      showAppSnackBar(
        context,
        'Informe um e-mail válido para receber o código.',
        type: SnackType.error,
      );
      return;
    }

    showAppSnackBar(
      context,
      'Código enviado para $email. Verifique sua caixa de entrada.',
      type: SnackType.success,
    );

    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (_, animation, secondaryAnimation) => CodePage(email: email),
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
                        'Recuperar senha',
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Informe seu e-mail cadastrado para receber um código de recuperação.',
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
                        AppInput(
                          label: 'E-mail',
                          keyboardType: TextInputType.emailAddress,
                          controller: _emailController,
                          prefixIcon: const Icon(
                            Icons.email,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ButtonSubmit(
                          label: 'Enviar código',
                          onPressed: _sendCode,
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
