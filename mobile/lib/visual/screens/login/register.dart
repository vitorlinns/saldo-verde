import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/utils/colors.dart';
import '../../../core/utils/supabase_client.dart';
import '../../widgets/btn/button_submit.dart';
import '../../widgets/inputs/input.dart';
import '../../widgets/snackbar/snack.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _birthdayController = TextEditingController();
  final _cpfController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _birthdayController.dispose();
    _cpfController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validateRequired(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Campo obrigatório';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Campo obrigatório';
    }
    final normalized = value.trim();
    if (!normalized.contains('@') || !normalized.contains('.')) {
      return 'E-mail inválido';
    }
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Campo obrigatório';
    }
    final digits = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length < 10 || digits.length > 11) {
      return 'Celular inválido';
    }
    return null;
  }

  String? _validateBirthday(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Campo obrigatório';
    }
    final normalized = value.trim();
    if (!RegExp(
          r'^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}',
        ).hasMatch(normalized) ||
        normalized.length != 10) {
      return 'Formato dd/mm/aaaa';
    }
    return null;
  }

  String? _validateCpf(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Campo obrigatório';
    }
    final digits = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length != 11 || !_isValidCpf(digits)) {
      return 'CPF inválido';
    }
    return null;
  }

  bool _isValidCpf(String digits) {
    if (RegExp(r'^([0-9])\1{10}').hasMatch(digits)) {
      return false;
    }

    final numbers = digits.split('').map(int.parse).toList();

    int calculateDigit(List<int> nums, int length) {
      var sum = 0;
      for (var i = 0; i < length - 1; i++) {
        sum += nums[i] * (length - i);
      }
      final remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    }

    final firstDigit = calculateDigit(numbers, 10);
    final secondDigit = calculateDigit(numbers, 11);

    return firstDigit == numbers[9] && secondDigit == numbers[10];
  }

  String? _validatePassword(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Campo obrigatório';
    }
    if (value.trim().length < 6) {
      return 'Senha muito curta';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Campo obrigatório';
    }
    if (value != _passwordController.text) {
      return 'As senhas não coincidem';
    }
    return null;
  }

  Future<void> _submit() async {
    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final birthday = _birthdayController.text.trim();
    final cpf = _cpfController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    final firstNameError = _validateRequired(firstName);
    if (firstNameError != null) {
      showAppSnackBar(
        context,
        'Informe o primeiro nome',
        type: SnackType.error,
      );
      return;
    }

    final lastNameError = _validateRequired(lastName);
    if (lastNameError != null) {
      showAppSnackBar(context, 'Informe o segundo nome', type: SnackType.error);
      return;
    }

    final emailError = _validateEmail(email);
    if (emailError != null) {
      showAppSnackBar(context, emailError, type: SnackType.error);
      return;
    }

    final phoneError = _validatePhone(phone);
    if (phoneError != null) {
      showAppSnackBar(context, phoneError, type: SnackType.error);
      return;
    }

    final birthdayError = _validateBirthday(birthday);
    if (birthdayError != null) {
      showAppSnackBar(context, birthdayError, type: SnackType.error);
      return;
    }

    final cpfError = _validateCpf(cpf);
    if (cpfError != null) {
      showAppSnackBar(context, cpfError, type: SnackType.error);
      return;
    }

    final passwordError = _validatePassword(password);
    if (passwordError != null) {
      showAppSnackBar(context, passwordError, type: SnackType.error);
      return;
    }

    final confirmPasswordError = _validateConfirmPassword(confirmPassword);
    if (confirmPasswordError != null) {
      showAppSnackBar(context, confirmPasswordError, type: SnackType.error);
      return;
    }

    late final dynamic response;
    try {
      response = await supabase.auth.signUp(email: email, password: password);
    } catch (error) {
      if (!mounted) return;
      final message = error.toString();
      if (message.contains('duplicate key value violates unique constraint') ||
          message.contains('users_email_partial_key')) {
        showAppSnackBar(
          context,
          'E-mail já cadastrado. Faça login ou recupere sua senha.',
          type: SnackType.error,
        );
      } else {
        showAppSnackBar(context, message, type: SnackType.error);
      }
      return;
    }

    final userId = response.user?.id ?? supabase.auth.currentUser?.id;
    if (userId != null) {
      try {
        await supabase
            .from('profiles')
            .update({
              'full_name': '$firstName $lastName',
              'phone': phone,
              'document': cpf.replaceAll(RegExp(r'[^0-9]'), ''),
              'metadata': {'birthday': birthday},
            })
            .eq('id', userId);
      } catch (error) {
        if (!mounted) return;
        showAppSnackBar(context, error.toString(), type: SnackType.error);
        return;
      }
    }

    if (!mounted) return;
    showAppSnackBar(
      context,
      'Conta criada com sucesso.',
      type: SnackType.success,
    );

    Navigator.of(context).pop();
  }

  int _digitsBeforeCursor(String text, int cursorPosition) {
    return text
        .substring(0, cursorPosition.clamp(0, text.length))
        .replaceAll(RegExp(r'[^0-9]'), '')
        .length;
  }

  int _cursorPositionFromDigits(String formatted, int digitIndex) {
    var count = 0;
    for (var i = 0; i < formatted.length; i++) {
      if (RegExp(r'[0-9]').hasMatch(formatted[i])) {
        count += 1;
      }
      if (count == digitIndex) {
        return i + 1;
      }
    }
    return formatted.length;
  }

  TextEditingValue _formatWithMask(
    TextEditingValue oldValue,
    TextEditingValue newValue,
    String mask,
  ) {
    var digits = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    final maxDigits = mask.replaceAll(RegExp(r'[^#]'), '').length;
    if (digits.length > maxDigits) {
      digits = digits.substring(0, maxDigits);
    }

    final formatted = StringBuffer();
    var digitIndex = 0;
    for (var i = 0; i < mask.length && digitIndex < digits.length; i++) {
      if (mask[i] == '#') {
        formatted.write(digits[digitIndex]);
        digitIndex += 1;
      } else {
        formatted.write(mask[i]);
      }
    }

    final digitsBeforeCursor = _digitsBeforeCursor(
      newValue.text,
      newValue.selection.end,
    );
    final cursorPos = _cursorPositionFromDigits(
      formatted.toString(),
      digitsBeforeCursor,
    );

    return TextEditingValue(
      text: formatted.toString(),
      selection: TextSelection.collapsed(offset: cursorPos),
    );
  }

  TextInputFormatter _dateFormatter() {
    return TextInputFormatter.withFunction((oldValue, newValue) {
      return _formatWithMask(oldValue, newValue, '##/##/####');
    });
  }

  TextInputFormatter _cpfFormatter() {
    return TextInputFormatter.withFunction((oldValue, newValue) {
      return _formatWithMask(oldValue, newValue, '###.###.###-##');
    });
  }

  TextInputFormatter _phoneFormatter() {
    return TextInputFormatter.withFunction((oldValue, newValue) {
      var digits = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
      if (digits.length > 11) digits = digits.substring(0, 11);

      final mask = digits.length > 10 ? '(##) #####-####' : '(##) ####-####';
      var masked = StringBuffer();
      var digitIndex = 0;
      for (var i = 0; i < mask.length && digitIndex < digits.length; i++) {
        if (mask[i] == '#') {
          masked.write(digits[digitIndex]);
          digitIndex += 1;
        } else {
          masked.write(mask[i]);
        }
      }

      final digitsBeforeCursor = _digitsBeforeCursor(
        newValue.text,
        newValue.selection.end,
      );
      final cursorPos = _cursorPositionFromDigits(
        masked.toString(),
        digitsBeforeCursor,
      );

      return TextEditingValue(
        text: masked.toString(),
        selection: TextSelection.collapsed(offset: cursorPos),
      );
    });
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
                      const SizedBox(height: 8),
                      Text(
                        'Crie sua conta',
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 0),
                      Text(
                        'Preencha seus dados para começar a usar o app.',
                        style: TextStyle(
                          color: AppColors.neutralText,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 0),
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
                          label: 'Primeiro Nome',
                          controller: _firstNameController,

                          prefixIcon: const Icon(
                            Icons.person,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppInput(
                          label: 'Segundo Nome',
                          controller: _lastNameController,

                          prefixIcon: const Icon(
                            Icons.person,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppInput(
                          label: 'E-mail',
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,

                          prefixIcon: const Icon(
                            Icons.email,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppInput(
                          label: 'Celular',
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,

                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            _phoneFormatter(),
                          ],
                          prefixIcon: const Icon(
                            Icons.phone,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppInput(
                          label: 'Data de Nascimento',
                          controller: _birthdayController,
                          keyboardType: TextInputType.datetime,

                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            _dateFormatter(),
                          ],
                          prefixIcon: const Icon(
                            Icons.calendar_today,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppInput(
                          label: 'CPF',
                          controller: _cpfController,
                          keyboardType: TextInputType.number,

                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            _cpfFormatter(),
                          ],
                          prefixIcon: const Icon(
                            Icons.badge,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 16),
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
                          label: 'Confirmar Senha',
                          controller: _confirmPasswordController,
                          obscureText: true,

                          prefixIcon: const Icon(
                            Icons.lock,
                            color: AppColors.neutralText,
                          ),
                        ),
                        const SizedBox(height: 24),
                        ButtonSubmit(label: 'Criar conta', onPressed: _submit),
                        const SizedBox(height: 16),
                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            children: [
                              const TextSpan(
                                text: 'Ao continuar você concorda com nossos ',
                                style: TextStyle(
                                  color: AppColors.neutralText,
                                  fontSize: 12,
                                  fontFamily: 'Funnel Display',
                                ),
                              ),
                              const TextSpan(
                                text: 'termos e políticas',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'Funnel Display',
                                ),
                              ),
                              const TextSpan(
                                text: '.',
                                style: TextStyle(
                                  color: AppColors.neutralText,
                                  fontSize: 12,
                                  fontFamily: 'Funnel Display',
                                ),
                              ),
                            ],
                          ),
                        ),
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
