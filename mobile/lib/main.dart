import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/theme.dart';
import 'visual/widgets/screens/login/login.dart';
import 'visual/widgets/screens/onboard/onboard.dart';
import 'visual/widgets/screens/splash/splash.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
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
      theme: AppTheme.light,
      builder: (context, child) {
        return SafeArea(
          top: false,
          bottom: false,
          child: child ?? const SizedBox.shrink(),
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
