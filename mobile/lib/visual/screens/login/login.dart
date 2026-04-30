import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/utils/colors.dart';
import '../../../core/utils/supabase_client.dart';
import '../../widgets/btn/button_submit.dart';
import '../../widgets/inputs/input.dart';
import '../../widgets/snackbar/snack.dart';
import 'recover.dart';
import 'register.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool keepConnected = false;
  bool _showPassword = false;
  bool _isSigningIn = false;
  bool _isLoading = false;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) {
    final normalized = email.trim();
    return normalized.contains('@') && normalized.contains('.');
  }

  Future<void> _submitLogin() async {
    if (_isLoading) return;

    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty) {
      showAppSnackBar(context, 'Preencha o e-mail', type: SnackType.error);
      return;
    }
    if (!_isValidEmail(email)) {
      showAppSnackBar(context, 'E-mail inválido', type: SnackType.error);
      return;
    }
    if (password.isEmpty) {
      showAppSnackBar(context, 'Preencha a senha', type: SnackType.error);
      return;
    }

    setState(() {
      _isLoading = true;
    });

    late final dynamic response;
    try {
      response = await supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
    } catch (error) {
      if (!mounted) return;

      final errorMessage = error.toString().toLowerCase();
      final friendlyMessage = error is AuthException ||
              errorMessage.contains('invalid login credentials') ||
              errorMessage.contains('invalid password') ||
              errorMessage.contains('invalid email')
          ? 'E-mail ou senha incorretos.'
          : 'Ocorreu um erro ao fazer login. Tente novamente.';

      showAppSnackBar(
        context,
        friendlyMessage,
        type: SnackType.error,
      );
      return;
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }

    if (response.session == null || response.user == null) {
      if (!mounted) return;
      showAppSnackBar(
        context,
        'E-mail ou senha inválidos. Verifique seus dados e tente novamente.',
        type: SnackType.error,
      );
      return;
    }

    final userId = response.user?.id ?? supabase.auth.currentUser?.id;
    if (userId == null) {
      if (!mounted) return;
      showAppSnackBar(context, 'Não autorizado.', type: SnackType.error);
      return;
    }

    try {
      await supabase
          .from('profiles')
          .update({'keep_connected': keepConnected})
          .eq('id', userId);
    } catch (error) {
      if (!mounted) return;
      showAppSnackBar(context, error.toString(), type: SnackType.error);
      return;
    }

    if (!mounted) return;
    showAppSnackBar(
      context,
      'Login realizado com sucesso',
      type: SnackType.success,
    );
  }

  Future<void> _signInWithGoogle() async {
    if (_isSigningIn) return;

    setState(() {
      _isSigningIn = true;
    });

    try {
      final googleServerClientId = dotenv.env['GOOGLE_SERVER_CLIENT_ID']?.trim();
      if (googleServerClientId == null || googleServerClientId.isEmpty) {
        if (!mounted) return;
        showAppSnackBar(
          context,
          'Erro ao fazer login com google',
          type: SnackType.error,
        );
        return;
      }

      final googleSignIn = GoogleSignIn(
        scopes: ['email'],
        serverClientId: googleServerClientId,
      );
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        if (!mounted) return;
        showAppSnackBar(
          context,
          'Login com Google cancelado.',
          type: SnackType.error,
        );
        return;
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) {
        if (!mounted) return;
        showAppSnackBar(
          context,
          'Não foi possível obter o token do Google. Verifique a configuração do Google Sign-In.',
          type: SnackType.error,
        );
        return;
      }

      // ignore: experimental_member_use
      final response = await supabase.auth.signInWithIdToken(
        provider: Provider.google,
        idToken: idToken,
      );

      if (response.session == null || response.user == null) {
        if (!mounted) return;
        showAppSnackBar(
          context,
          'Não foi possível concluir o login com Google.',
          type: SnackType.error,
        );
        return;
      }

      final userId = response.user?.id ?? supabase.auth.currentUser?.id;
      if (userId == null) {
        if (!mounted) return;
        showAppSnackBar(
          context,
          'Não autorizado.',
          type: SnackType.error,
        );
        return;
      }

      await supabase
          .from('profiles')
          .update({'keep_connected': keepConnected})
          .eq('id', userId);

      if (!mounted) return;
      showAppSnackBar(
        context,
        'Login com Google realizado com sucesso.',
        type: SnackType.success,
      );
    } catch (error) {
      if (!mounted) return;
      showAppSnackBar(
        context,
        'Erro ao iniciar login com Google. Tente novamente.',
        type: SnackType.error,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSigningIn = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final headerHeight = size.height * 0.38;

    return Scaffold(
      backgroundColor: AppColors.background,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        top: false,
        child: SizedBox(
          width: size.width,
          height: size.height,
          child: Stack(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: double.infinity,
                    height: headerHeight,
                    padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      image: const DecorationImage(
                        image: AssetImage(
                          'lib/assets/images/background_coin.png',
                        ),
                        fit: BoxFit.cover,
                        alignment: Alignment.topRight,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 28),
                        Align(
                          alignment: Alignment.center,
                          child: SvgPicture.asset(
                            'lib/assets/images/logo_dark.svg',
                            width: 54,
                            height: 54,
                            fit: BoxFit.contain,
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Align(
                          alignment: Alignment.center,
                          child: Text(
                            'Entre ou crie sua conta.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.black,
                              fontSize: 28,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(child: Container(color: AppColors.background)),
                ],
              ),
              Positioned(
                top: headerHeight - 90,
                left: 0,
                right: 0,
                bottom: 0,
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(32),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Container(
                    width: double.infinity,
                    decoration: const BoxDecoration(color: AppColors.surface),
                    padding: const EdgeInsets.fromLTRB(24, 22, 24, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 16),
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
                        AppInput(
                          label: 'Senha',
                          obscureText: !_showPassword,
                          controller: _passwordController,
                          prefixIcon: const Icon(
                            Icons.lock,
                            color: AppColors.neutralText,
                          ),
                          suffixIcon: GestureDetector(
                            onTap: () {
                              setState(() {
                                _showPassword = !_showPassword;
                              });
                            },
                            child: Icon(
                              _showPassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                              color: AppColors.neutralText,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Checkbox(
                                  value: keepConnected,
                                  onChanged: (value) {
                                    setState(() {
                                      keepConnected = value ?? false;
                                    });
                                  },
                                  activeColor: AppColors.primary,
                                  checkColor: AppColors.black,
                                ),
                                const SizedBox(width: 8),
                                const Text(
                                  'Manter conectado',
                                  style: TextStyle(
                                    color: AppColors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            const Spacer(),
                            GestureDetector(
                              onTap: () {
                                Navigator.of(context).push(
                                  PageRouteBuilder(
                                    pageBuilder:
                                        (_, animation, secondaryAnimation) =>
                                            const RecoverPage(),
                                    transitionDuration: const Duration(
                                      milliseconds: 300,
                                    ),
                                    transitionsBuilder:
                                        (
                                          _,
                                          animation,
                                          secondaryAnimation,
                                          child,
                                        ) {
                                          final tween =
                                              Tween<Offset>(
                                                begin: const Offset(1.0, 0.0),
                                                end: Offset.zero,
                                              ).chain(
                                                CurveTween(
                                                  curve: Curves.easeInOut,
                                                ),
                                              );
                                          return SlideTransition(
                                            position: animation.drive(tween),
                                            child: child,
                                          );
                                        },
                                  ),
                                );
                              },
                              child: const Text(
                                'Esqueceu a senha?',
                                style: TextStyle(
                                  color: AppColors.gray,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ButtonSubmit(
                          label: 'Entrar',
                          isLoading: _isLoading,
                          onPressed: _submitLogin,
                        ),
                        const SizedBox(height: 16),
                        const Align(
                          alignment: Alignment.center,
                          child: Text(
                            'Ou',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.neutralText,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton.icon(
                            onPressed: _signInWithGoogle,
                            icon: _isSigningIn
                                ? SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      valueColor: const AlwaysStoppedAnimation(
                                        AppColors.white,
                                      ),
                                      strokeWidth: 2.4,
                                    ),
                                  )
                                : Image.asset(
                                    'lib/assets/images/icons/google.png',
                                    width: 28,
                                    height: 22,
                                  ),
                            label: Text(
                              _isSigningIn ? 'Carregando...' : 'Entrar com Google',
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: const TextStyle(
                                color: AppColors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color.fromARGB(
                                103,
                                26,
                                26,
                                26,
                              ),
                              foregroundColor: AppColors.white,
                              side: const BorderSide(
                                color: Color.fromRGBO(255, 255, 255, 0.16),
                                width: 1,
                              ),
                              padding: const EdgeInsets.symmetric(
                                vertical: 18,
                                horizontal: 16,
                              ),
                              minimumSize: const Size.fromHeight(56),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 0,
                            vertical: 12,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                'Não tem conta? ',
                                style: TextStyle(
                                  color: AppColors.white,
                                  fontSize: 14,
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => const RegisterPage(),
                                    ),
                                  );
                                },
                                child: const Text(
                                  'Criar conta grátis!',
                                  style: TextStyle(
                                    color: AppColors.gray,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
