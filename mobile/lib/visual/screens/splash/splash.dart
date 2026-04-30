import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/utils/colors.dart';
import '../../../core/utils/supabase_client.dart';

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
    final session = supabase.auth.currentSession;
    final autoRoute = await _getInitialRoute(session);

    _timer = Timer(const Duration(seconds: 3), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed(autoRoute);
    });
  }

  Future<String> _getInitialRoute(Session? session) async {
    if (session == null) {
      return '/onboard';
    }

    try {
      final profile = await supabase
          .from('profiles')
          .select('keep_connected')
          .eq('id', session.user.id)
          .single();

      final keepConnected =
          (profile.data as Map<String, dynamic>?)?['keep_connected'] as bool?;
      if (keepConnected == true) {
        return '/onboard';
      }
    } catch (_) {
      await supabase.auth.signOut();
      return '/login';
    }

    await supabase.auth.signOut();
    return '/login';
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
