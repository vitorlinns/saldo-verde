import 'package:flutter/material.dart';
import '../../../../core/utils/colors.dart';
import '../../btn/button_submit.dart';
import '../../inputs/input.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 28),
              Text(
                'Acessar',
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Entre para continuar no Saldo Verde.',
                style: const TextStyle(
                  color: AppColors.neutralText,
                  fontSize: 16,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color.fromRGBO(0, 0, 0, 0.2),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                      AppInput(
                      label: 'E-mail',
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    AppInput(
                      label: 'Senha',
                      obscureText: true,
                    ),
                  ],
                ),
              ),
              const Spacer(),
              ButtonSubmit(
                label: 'Entrar',
                onPressed: () {
                  // TODO: implementar autenticação e fluxo de próxima tela
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
