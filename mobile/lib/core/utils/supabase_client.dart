import 'dart:io';

import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

String get _supabaseUrl {
  final value = dotenv.env['SUPABASE_URL'] ?? Platform.environment['SUPABASE_URL'] ?? '';
  final normalized = _normalizeUrl(value);
  return _isPlaceholder(normalized) ? '' : normalized;
}

String get _supabaseAnonKey {
  final value = dotenv.env['SUPABASE_ANON_KEY'] ?? Platform.environment['SUPABASE_ANON_KEY'] ?? '';
  return _isPlaceholder(value) ? '' : value;
}

String get _authCallbackHostname =>
    dotenv.env['SUPABASE_AUTH_CALLBACK_HOSTNAME'] ??
    Platform.environment['SUPABASE_AUTH_CALLBACK_HOSTNAME'] ??
    'login-callback';

String _normalizeUrl(String value) {
  if (value.isEmpty) return value;
  try {
    final uri = Uri.parse(value);
    if (uri.scheme.isEmpty || uri.host.isEmpty) return value;
    return '${uri.scheme}://${uri.host}${uri.hasPort ? ':${uri.port}' : ''}';
  } catch (_) {
    return value;
  }
}

bool _isPlaceholder(String value) {
  final lowered = value.toLowerCase();
  return value.isEmpty || lowered.contains('your-project') || lowered.contains('your-anon-key') || lowered.contains('replace');
}

Future<void> initSupabase() async {
  if (_supabaseUrl.isEmpty || _supabaseAnonKey.isEmpty) {
throw Exception(
      'Missing or invalid Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY in mobile/.env or process environment.',
    );
  }

  await Supabase.initialize(
    url: _supabaseUrl,
    anonKey: _supabaseAnonKey,
    authCallbackUrlHostname: _authCallbackHostname,
    debug: false,
  );
}

SupabaseClient get supabase => Supabase.instance.client;
