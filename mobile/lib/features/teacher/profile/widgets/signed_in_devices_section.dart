import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';

class DeviceSession {
  final int id;
  final String device;
  final bool isCurrent;
  final String? createdAt;
  final String? lastActivityAt;
  final String? ipAddress;

  DeviceSession({
    required this.id,
    required this.device,
    required this.isCurrent,
    this.createdAt,
    this.lastActivityAt,
    this.ipAddress,
  });

  factory DeviceSession.fromJson(Map<String, dynamic> json) {
    return DeviceSession(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      device: json['device']?.toString() ?? 'Unknown device',
      isCurrent: json['current'] == true,
      createdAt: json['created_at']?.toString(),
      lastActivityAt: json['last_activity_at']?.toString(),
      ipAddress: json['ip_address']?.toString(),
    );
  }
}

class SignedInDevicesSection extends ConsumerStatefulWidget {
  const SignedInDevicesSection({super.key});

  @override
  ConsumerState<SignedInDevicesSection> createState() =>
      _SignedInDevicesSectionState();
}

class _SignedInDevicesSectionState extends ConsumerState<SignedInDevicesSection> {
  List<DeviceSession> _sessions = [];
  int? _limit;
  bool _isLoading = true;
  String? _error;
  int? _revokingId;

  @override
  void initState() {
    super.initState();
    _fetchSessions();
  }

  Future<void> _fetchSessions() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/auth/sessions');
      if (res.data != null && res.data['sessions'] is List) {
        final raw = res.data['sessions'] as List;
        final list = raw.map((s) => DeviceSession.fromJson(s)).toList();
        if (mounted) {
          setState(() {
            _sessions = list;
            _limit = res.data['limit'] as int?;
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _signOut(DeviceSession session) async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isFr ? 'Déconnecter cet appareil ?' : 'Sign out this device?'),
        content: Text(
          session.isCurrent
              ? (isFr
                  ? 'Il s\'agit de votre appareil actuel. Vous serez déconnecté de l\'application.'
                  : 'This is your current device. You will be signed out of the app.')
              : (isFr
                  ? 'Cet appareil n\'aura plus accès à votre compte enseignant.'
                  : 'This device will lose access to your teacher account.'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(isFr ? 'Annuler' : 'Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bad,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(isFr ? 'Déconnecter' : 'Sign out'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _revokingId = session.id);

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.delete('/auth/sessions/${session.id}');
      if (res.data != null) {
        if (session.isCurrent) {
          await ref.read(authNotifierProvider.notifier).logout();
          return;
        }
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppColors.good,
              content: Text(
                isFr ? 'Appareil déconnecté.' : 'Device signed out.',
              ),
            ),
          );
          _fetchSessions();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.bad,
            content: Text(
              isFr ? 'Impossible de déconnecter l\'appareil.' : 'Failed to sign out device.',
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _revokingId = null);
    }
  }

  IconData _iconForDevice(String dev) {
    final lower = dev.toLowerCase();
    if (lower.contains('android') || lower.contains('iphone') || lower.contains('ipad') || lower.contains('mobile')) {
      return Icons.smartphone;
    }
    if (lower.contains('mac') || lower.contains('windows') || lower.contains('linux')) {
      return Icons.laptop_mac;
    }
    return Icons.desktop_windows;
  }

  String _formatFriendlyTime(String? dateStr, bool isFr) {
    if (dateStr == null || dateStr.isEmpty) {
      return isFr ? 'à l\'instant' : 'just now';
    }
    try {
      final s = dateStr.contains('T') ? dateStr : dateStr.replaceAll(' ', 'T');
      final dt = DateTime.parse(s);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 2) return isFr ? 'à l\'instant' : 'just now';
      if (diff.inMinutes < 60) return isFr ? 'il y a ${diff.inMinutes} min' : '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return isFr ? 'il y a ${diff.inHours} h' : '${diff.inHours}h ago';
      return isFr ? 'il y a ${diff.inDays} j' : '${diff.inDays}d ago';
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.devices,
                  color: Color(0xFF4338CA),
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Appareils connectés' : 'Signed in devices',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isFr
                          ? 'Tous les appareils connectés à votre compte. Déconnectez tout appareil non reconnu.'
                          : 'Everywhere your account is signed in. Sign out anything you don\'t recognise.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              if (_limit != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFBFDBFE)),
                  ),
                  child: Text(
                    '${_sessions.length} / $_limit',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF2563EB),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
              ],
              IconButton(
                icon: const Icon(Icons.refresh, size: 20, color: AppColors.textMuted),
                onPressed: _fetchSessions,
                tooltip: isFr ? 'Actualiser' : 'Refresh',
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Content
          if (_isLoading) ...[
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(),
              ),
            ),
          ] else if (_error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.badBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      isFr ? 'Impossible de charger vos appareils.' : 'Could not load your devices.',
                      style: AppTypography.caption.copyWith(color: AppColors.bad),
                    ),
                  ),
                  TextButton(
                    onPressed: _fetchSessions,
                    child: Text(isFr ? 'Réessayer' : 'Retry'),
                  ),
                ],
              ),
            ),
          ] else if (_sessions.isEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                isFr ? 'Aucun autre appareil n\'est connecté.' : 'No other device is signed in.',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
              ),
            ),
          ] else ...[
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _sessions.length,
              separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderSoft),
              itemBuilder: (context, index) {
                final s = _sessions[index];
                final isCurrent = s.isCurrent;
                final isRevoking = _revokingId == s.id;

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Row(
                    children: [
                      // Device Icon Box
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: isCurrent ? const Color(0xFFECFDF5) : AppColors.frenchPaper,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          _iconForDevice(s.device),
                          size: 18,
                          color: isCurrent ? const Color(0xFF047857) : AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Device Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    s.device,
                                    style: AppTypography.bodySmall.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.ink,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (isCurrent) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECFDF5),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: const Color(0xFFA7F3D0)),
                                    ),
                                    child: Text(
                                      isFr ? 'Cet appareil' : 'This device',
                                      style: const TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF047857),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${isFr ? 'Connecté ' : 'Signed in '}${_formatFriendlyTime(s.createdAt, isFr)} · ${isFr ? 'Dernière activité ' : 'Last used '}${_formatFriendlyTime(s.lastActivityAt, isFr)}',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textMuted,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Action Button
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: isCurrent ? AppColors.textMuted : AppColors.bad,
                          side: BorderSide(
                            color: isCurrent ? AppColors.border : const Color(0xFFFECACA),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          minimumSize: const Size(0, 32),
                        ),
                        onPressed: isRevoking ? null : () => _signOut(s),
                        child: isRevoking
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(
                                isFr ? 'Déconnecter' : 'Sign out',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}
