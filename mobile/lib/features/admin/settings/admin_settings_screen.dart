import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';

/// Attendance rules for every class: the check-in code, when sessions open
/// and close, and whether a code is required. Same limits as the web.
class AdminSettingsScreen extends ConsumerStatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  ConsumerState<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends ConsumerState<AdminSettingsScreen> {
  static const _defaults = <String, Object>{
    'code_length': 6,
    'code_expiry_minutes': 30,
    'early_start_minutes': 15,
    'late_join_minutes': 10,
    'auto_end_minutes': 15,
    'require_code_for_attendance': true,
  };
  static const _limits = {
    'code_length': (4, 12),
    'code_expiry_minutes': (1, 120),
    'early_start_minutes': (0, 60),
    'late_join_minutes': (0, 60),
    'auto_end_minutes': (0, 180),
  };

  Map<String, Object> _saved = Map.of(_defaults);
  Map<String, Object> _values = Map.of(_defaults);
  DateTime? _updated;
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/admin/settings');
      final rows = J.list(res.data, ['settings']);
      final map = {for (final r in rows) J.s(r['setting_key']): J.s(r['setting_value'])};
      DateTime? updated;
      for (final r in rows) {
        final d = J.date(r['updated_at']);
        if (d != null && (updated == null || d.isAfter(updated))) updated = d;
      }
      final values = <String, Object>{
        for (final k in _limits.keys) k: int.tryParse(map[k] ?? '') ?? _defaults[k]!,
        'require_code_for_attendance': (map['require_code_for_attendance'] ?? 'true') == 'true',
      };
      if (!mounted) return;
      setState(() {
        _saved = values;
        _values = Map.of(values);
        _updated = updated;
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _loading = false;
        });
      }
    }
  }

  bool get _dirty => _defaults.keys.any((k) => _values[k] != _saved[k]);

  Future<void> _save() async {
    final fr = context.isFrench;
    setState(() => _saving = true);
    try {
      await ref.read(apiClientProvider).put('/admin/settings', data: {
        'settings': {for (final e in _values.entries) e.key: '${e.value}'},
      });
      if (!mounted) return;
      adminToast(context, fr ? 'Réglages enregistrés : ils s’appliquent aux nouvelles séances' : 'Settings saved: they apply to new sessions');
      await _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _number(String key, String label, String unit, String help) {
    final (min, max) = _limits[key]!;
    final v = _values[key] as int;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
                const SizedBox(height: 2),
                Text(help, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton.outlined(
            onPressed: v <= min ? null : () => setState(() => _values[key] = v - 1),
            icon: const Icon(Icons.remove, size: 18),
            visualDensity: VisualDensity.compact,
          ),
          SizedBox(
            width: 64,
            child: Column(
              children: [
                Text('$v', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
                Text(unit, style: AppTypography.caption.copyWith(fontSize: 10.5, color: AppColors.textMuted)),
              ],
            ),
          ),
          IconButton.outlined(
            onPressed: v >= max ? null : () => setState(() => _values[key] = v + 1),
            icon: const Icon(Icons.add, size: 18),
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null) return AdminError(message: _error!, onRetry: _load);
    final requireCode = _values['require_code_for_attendance'] as bool;

    final page = AdminPage(
      onRefresh: _load,
      maxWidth: 820,
      children: [
        AdminHeader(
          overline: fr ? 'Présences' : 'Attendance',
          title: fr ? 'Réglages des séances' : 'Session settings',
          subtitle: _updated == null ? null : (fr ? 'Dernière modification ${AdminFmt.relative(context, _updated)}' : 'Last changed ${AdminFmt.relative(context, _updated)}'),
        ),
        AdminCard(
          title: fr ? 'Code de présence' : 'Check-in code',
          icon: Icons.pin_outlined,
          child: Column(
            children: [
              _number('code_length', fr ? 'Longueur du code' : 'Code length', fr ? 'chiffres' : 'digits', fr ? 'Entre 4 et 12 chiffres.' : 'Between 4 and 12 digits.'),
              const Divider(color: AppColors.borderSoft),
              _number('code_expiry_minutes', fr ? 'Validité du code' : 'Code stays valid for', 'min', fr ? 'Ensuite, le professeur doit en générer un nouveau.' : 'After this, the teacher must generate a new code.'),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Horaires des séances' : 'Session timing',
          icon: Icons.timer_outlined,
          child: Column(
            children: [
              _number('early_start_minutes', fr ? 'Démarrage anticipé' : 'Teachers can start early by', 'min', fr ? '0 = seulement à l’heure prévue.' : '0 means only at the scheduled time.'),
              const Divider(color: AppColors.borderSoft),
              _number('late_join_minutes', fr ? 'Arrivée tardive acceptée' : 'Students can join late by', 'min', fr ? 'Compté depuis le début de la séance.' : 'Counted from the moment the session starts.'),
              const Divider(color: AppColors.borderSoft),
              _number('auto_end_minutes', fr ? 'Fermeture après la fin' : 'Close session after end by', 'min', fr ? 'Compté depuis l’heure de fin prévue.' : 'Counted from the scheduled end time.'),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Règle de pointage' : 'Check-in rule',
          icon: Icons.rule,
          child: Column(
            children: [
              for (final on in [true, false])
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Material(
                    color: requireCode == on ? (on ? AppColors.adminAccentBg : AppColors.warnBg) : AppColors.pureWhite,
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      onTap: () => setState(() => _values['require_code_for_attendance'] = on),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: requireCode == on ? (on ? AppColors.adminAccent : AppColors.warn) : AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Icon(requireCode == on ? Icons.radio_button_checked : Icons.radio_button_off, color: requireCode == on ? (on ? AppColors.adminAccent : AppColors.warn) : AppColors.textSubtle),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(on ? (fr ? 'Code obligatoire' : 'Code required') : (fr ? 'Sans code' : 'No code needed'), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
                                  Text(
                                    on
                                        ? (fr ? 'Les étudiants saisissent le code donné par le professeur. Recommandé.' : 'Students must type the code the teacher shares. Recommended.')
                                        : (fr ? 'Les étudiants sont marqués présents sans rien saisir.' : 'Students are marked present without entering anything.'),
                                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 90),
      ],
    );

    return Stack(
      children: [
        page,
        if (_dirty)
          Positioned(
            left: 12,
            right: 12,
            bottom: 12,
            child: SafeArea(
              child: Material(
                elevation: 6,
                borderRadius: BorderRadius.circular(14),
                color: AppColors.ink,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 10, 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          fr ? 'Modifications non enregistrées' : 'You have unsaved changes',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.pureWhite, fontWeight: FontWeight.w700),
                        ),
                      ),
                      TextButton(
                        onPressed: _saving ? null : () => setState(() => _values = Map.of(_saved)),
                        style: TextButton.styleFrom(foregroundColor: AppColors.pureWhite),
                        child: Text(fr ? 'Annuler' : 'Discard'),
                      ),
                      const SizedBox(width: 6),
                      FilledButton(
                        onPressed: _saving ? null : _save,
                        style: FilledButton.styleFrom(backgroundColor: AppColors.adminAccent),
                        child: _saving
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.pureWhite))
                            : Text(fr ? 'Enregistrer' : 'Save'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
