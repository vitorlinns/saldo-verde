import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'visual/screens/login/login.dart';
import 'visual/screens/onboard/onboard.dart';
import 'visual/screens/splash/splash.dart';
import 'core/utils/colors.dart';
import 'core/utils/supabase_client.dart';

class RightToLeftPageTransitionsBuilder extends PageTransitionsBuilder {
  const RightToLeftPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(1.0, 0.0),
        end: Offset.zero,
      ).chain(CurveTween(curve: Curves.easeInOut)).animate(animation),
      child: child,
    );
  }
}

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

  Route<dynamic>? _buildSlideRoute(RouteSettings settings) {
    late final Widget page;
    switch (settings.name) {
      case '/onboard':
        page = const OnboardPage();
        break;
      case '/login':
        page = const LoginPage();
        break;
      default:
        return null;
    }

    return PageRouteBuilder(
      settings: settings,
      pageBuilder: (_, animation, secondaryAnimation) => page,
      transitionDuration: const Duration(milliseconds: 300),
      transitionsBuilder: (_, animation, secondaryAnimation, child) {
        final tween = Tween<Offset>(
          begin: const Offset(1.0, 0.0),
          end: Offset.zero,
        ).chain(CurveTween(curve: Curves.easeInOut));
        return SlideTransition(position: animation.drive(tween), child: child);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Saldo Verde',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Funnel Display',
        scaffoldBackgroundColor: AppColors.background,
        canvasColor: AppColors.background,
        splashFactory: NoSplash.splashFactory,
        highlightColor: Colors.transparent,
        splashColor: Colors.transparent,
        hoverColor: Colors.transparent,
        focusColor: Colors.transparent,
        textSelectionTheme: const TextSelectionThemeData(
          cursorColor: AppColors.white,
          selectionColor: Color.fromARGB(80, 255, 255, 255),
          selectionHandleColor: AppColors.white,
        ),
        pageTransitionsTheme: const PageTransitionsTheme(
          builders: {
            TargetPlatform.android: RightToLeftPageTransitionsBuilder(),
            TargetPlatform.iOS: RightToLeftPageTransitionsBuilder(),
            TargetPlatform.linux: RightToLeftPageTransitionsBuilder(),
            TargetPlatform.macOS: RightToLeftPageTransitionsBuilder(),
            TargetPlatform.windows: RightToLeftPageTransitionsBuilder(),
          },
        ),
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
      onGenerateRoute: _buildSlideRoute,
      routes: {
        '/onboard': (context) => const OnboardPage(),
        '/login': (context) => const LoginPage(),
      },
    );
  }
}
