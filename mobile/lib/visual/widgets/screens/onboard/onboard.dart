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
      backgroundColor: AppColors.background,
      body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 2),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Image.asset(
                      'lib/assets/images/logo.png',
                      width: 110,
                      height: 110,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Assuma o controle do seu dinheiro, e saiba para onde ele está indo.',
                    style: const TextStyle(
                      color: AppColors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 26,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Lance receitas e despesas com rapidez, consulte o saldo atualizado e veja seu orçamento sempre alinhado com suas metas.',
                    style: const TextStyle(
                      color: AppColors.neutralText,
                      fontSize: 16,
                      height: 1.7,
                    ),
                  ),
                  const SizedBox(height: 28),
                  _FeatureCard(
                    icon: Icons.star,
                    title: 'Substitua planilhas',
                    description: 'Com Saldo Verde você não precisa se perder nas inúmeras linhas de excel.',
                  ),
                  const SizedBox(height: 16),
                  _FeatureCard(
                    icon: Icons.donut_large,
                    title: 'Economize de verdade',
                    description: 'Saldo Verde te mostra exatamente tudo com o que você gasta.',
                  ),
                  const SizedBox(height: 16),
                  _FeatureCard(
                    icon: Icons.online_prediction,
                    title: 'Saldo em tempo real',
                    description: 'Saiba quando gastou e quanto ainda tem disponível!.',
                  ),
                  const Spacer(),
                  ButtonSubmit(
                    label: 'Começar agora',
                    onPressed: () => _goNext(context),                
                  ),
                ],
              ),
            ),
          ),
      );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF161616),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color.fromARGB(37, 101, 101, 101),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.surfaceVariant)
            ),
            child: Icon(icon, color: AppColors.primary, size: 26),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  description,
                  style: const TextStyle(
                    color: AppColors.neutralText,
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
