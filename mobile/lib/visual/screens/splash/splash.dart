import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/utils/colors.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _prepareStartup();
  }

  Future<void> _prepareStartup() async {
    _timer = Timer(const Duration(seconds: 3), () {
      if (!mounted) return;

      final session = Supabase.instance.client.auth.currentSession;
      debugPrint('Supabase launch session: $session');
      Navigator.of(context).pushReplacementNamed('/onboard');
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Container(
        color: AppColors.background,
        child: Center(
          child: SvgPicture.asset(
            'lib/assets/images/logo.svg',
            width: 54,
            height: 54,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}
