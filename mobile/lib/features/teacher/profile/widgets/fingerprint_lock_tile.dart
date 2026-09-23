import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/auth/app_lock.dart';
import '../../../../core/constants/app_colors.dart';

/// Profile › Sign-in & security: turn fingerprint unlock on or off.
class FingerprintLockTile extends ConsumerStatefulWidget {
  final bool isFr;

  const FingerprintLockTile({super.key, required this.isFr});

  @override
  ConsumerState<FingerprintLockTile> createState() => _FingerprintLockTileState();
}

class _FingerprintLockTileState extends ConsumerState<FingerprintLockTile> {
  bool? _available;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    ref.read(appLockProvider).isAvailable().then((available) {
      if (mounted) setState(() => _available = available);
    });
  }

  Future<void> _toggle(bool on) async {
    final isFr = widget.isFr;
    final lock = ref.read(appLockProvider);
    setState(() => _busy = true);
    bool ok = true;
    if (on) {
      ok = await lock.enable(
        isFr ? 'Confirmez votre empreinte pour l\'activer' : 'Confirm your fingerprint to turn it on',
      );
    } else {
      // Turning protection off needs the owner too.
      ok = await lock.authenticate(
        isFr ? 'Confirmez pour désactiver l\'empreinte' : 'Confirm to turn fingerprint unlock off',
      );
      if (ok) await lock.disable();
    }
    if (!mounted) return;
    setState(() => _busy = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: ok ? AppColors.good : AppColors.bad,
        content: Text(
          !ok
              ? (isFr ? 'Empreinte non confirmée.' : 'Fingerprint not confirmed.')
              : on
                  ? (isFr ? 'Déverrouillage par empreinte activé.' : 'Fingerprint unlock is on.')
                  : (isFr ? 'Déverrouillage par empreinte désactivé.' : 'Fingerprint unlock is off.'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFr = widget.isFr;
    final enabled = ref.watch(appLockProvider.select((l) => l.isEnabled));
    final available = _available;

    final String subtitle;
    if (available == false) {
      subtitle = isFr
          ? 'Aucune empreinte enregistrée sur ce téléphone. Ajoutez-en une dans les réglages Android.'
          : 'No fingerprint is set up on this phone. Add one in Android settings.';
    } else {
      subtitle = isFr
          ? 'Demandée à l\'ouverture de l\'application et après 5 minutes d\'absence.'
          : 'Asked when you open the app and after 5 minutes away.';
    }

    return Row(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: AppColors.frenchPaper,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.fingerprint, size: 18, color: AppColors.textMuted),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isFr ? 'Déverrouillage par empreinte' : 'Fingerprint unlock',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        if (_busy || available == null)
          const SizedBox(
            width: 48,
            height: 24,
            child: Center(
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.frenchNavy),
              ),
            ),
          )
        else
          Switch(
            value: enabled,
            activeTrackColor: AppColors.frenchNavy,
            onChanged: available || enabled ? _toggle : null,
          ),
      ],
    );
  }
}
