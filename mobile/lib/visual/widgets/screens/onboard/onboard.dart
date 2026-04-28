import 'package:flutter/material.dart';
import '../../../../core/utils/colors.dart';
import '../../btn/button_submit.dart';

class OnboardPage extends StatelessWidget {
  const OnboardPage({super.key});

  void _goNext(BuildContext context) {
    Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: Column(
        children: [
            Expanded(
              child: Image.asset(
                'lib/assets/images/onboard.png',
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
              ),
            ),
            SafeArea(
              top: false,
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                  boxShadow: [
                    BoxShadow(
                      color: Color.fromARGB(45, 23, 23, 23),
                      blurRadius: 30,
                      offset: Offset(0, -12),
                    ),
                  ],
                ),
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Bem-vindo ao Saldo Verde',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Organize suas finanças e controle suas despesas de forma simples.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, height: 1.6),
                    ),
                    const SizedBox(height: 28),
                    ButtonSubmit(
                      label: 'Próximo',
                      onPressed: () => _goNext(context),
                      height: 56,
                      borderRadius: 20,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
    );
  }
}
