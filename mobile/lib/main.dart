import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'visual/widgets/screens/login/login.dart';
import 'visual/widgets/screens/onboard/onboard.dart';
import 'visual/widgets/screens/splash/splash.dart';
import 'core/utils/supabase_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(
    fileName: '.env',
    mergeWith: Platform.environment,
    isOptional: false,
  );

  await initSupabase();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
    ),
  );
  runApp(const SaldoVerdeApp());
}

class SaldoVerdeApp extends StatelessWidget {
  const SaldoVerdeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Saldo Verde',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Funnel Display',
      ),
      builder: (context, child) {
        return AnnotatedRegion<SystemUiOverlayStyle>(
          value: SystemUiOverlayStyle.light,
          child: SafeArea(
            top: false,
            bottom: false,
            child: child ?? const SizedBox.shrink(),
          ),
        );
      },
      home: const SplashPage(),
      routes: {
        '/onboard': (context) => const OnboardPage(),
        '/login': (context) => const LoginPage(),
      },
    );
  }
}
