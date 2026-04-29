import 'package:flutter/material.dart';
import '../../../core/utils/colors.dart';
import '../../widgets/btn/button_submit.dart';
import '../../widgets/inputs/input.dart';
import '../../widgets/snackbar/snack.dart';

class NewPasswordPage extends StatefulWidget {
  const NewPasswordPage({super.key});

  @override
  State<NewPasswordPage> createState() => _NewPasswordPageState();
}

class _NewPasswordPageState extends State<NewPasswordPage> {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _resetPassword() {
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (password.isEmpty || confirmPassword.isEmpty) {
      showAppSnackBar(
        context,
        'Preencha ambos os campos de senha.',
        type: SnackType.error,
      );
      return;
    }

    if (password.length < 6) {
      showAppSnackBar(
        context,
        'A senha deve ter pelo menos 6 caracteres.',
        type: SnackType.error,
      );
      return;
    }

    if (password != confirmPassword) {
      showAppSnackBar(
        context,
        'As senhas não coincidem.',
        type: SnackType.error,
      );
      return;
    }

    showAppSnackBar(
      context,
      'Senha redefinida com sucesso.',
      type: SnackType.success,
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
                        'Nova senha',
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Digite sua nova senha e confirme para finalizar a recuperação.',
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
                          label: 'Senha',
                          controller: _passwordController,
                          obscureText: true,
                          prefixIcon: const Icon(
                            Icons.lock,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppInput(
                          label: 'Confirmar senha',
                          controller: _confirmPasswordController,
                          obscureText: true,
                          prefixIcon: const Icon(
                            Icons.lock,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 24),
                        ButtonSubmit(label: 'Redefinir senha', onPressed: _resetPassword),
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
