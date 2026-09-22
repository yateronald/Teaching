import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final appLocaleProvider = StateNotifierProvider<AppLocaleNotifier, Locale>((ref) {
  return AppLocaleNotifier();
});

class AppLocaleNotifier extends StateNotifier<Locale> {
  static const String _prefKey = 'app_language_code';

  AppLocaleNotifier() : super(const Locale('fr', 'FR')) {
    _loadPersistedLocale();
  }

  Future<void> _loadPersistedLocale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final code = prefs.getString(_prefKey);
      if (code == 'en') {
        state = const Locale('en', 'US');
      } else if (code == 'fr') {
        state = const Locale('fr', 'FR');
      }
    } catch (_) {
      // Fallback remains French
    }
  }

  Future<void> toggleLocale() async {
    final next = state.languageCode == 'fr' ? const Locale('en', 'US') : const Locale('fr', 'FR');
    await setLocale(next);
  }

  Future<void> setLocale(Locale newLocale) async {
    state = newLocale;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, newLocale.languageCode);
    } catch (_) {}
  }
}
